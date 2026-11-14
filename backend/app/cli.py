import os
import sys
import json
import typer
from typing import Optional
from rich.console import Console
from rich.table import Table

from app.core.config import settings
from app.core.logging import logger, setup_logging
from app.db.session import SessionLocal, engine
from app.db.models import Country, Region, IngestionFile, RejectedRow, FireDetection
from app.ingestion.discovery import discover_csv_files
from app.ingestion.schema_inspector import inspect_csv_schema
from app.ingestion.importer import IngestionPipeline
from app.db.init_db import init_database

app = typer.Typer(help="Fire Intelligence Platform CLI - Ingestion, Audit & Management")
console = Console()

@app.command()
def audit():
    """Discovers all dataset files and audits their headers, schemas, and counts."""
    setup_logging()
    console.print("[bold cyan]=== Fire Intelligence Dataset Audit ===[/bold cyan]")
    
    base_dirs = {
        "BRA": settings.DATASET_BRAZIL_PATH,
        "CAN": settings.DATASET_CANADA_PATH
    }
    
    files = discover_csv_files(base_dirs)
    if not files:
        console.print("[bold red]No CSV files found in configured paths![/bold red]")
        return

    table = Table(title=f"Discovered Dataset Files ({len(files)} files)")
    table.add_column("Country", style="cyan")
    table.add_column("Filename", style="green")
    table.add_column("Size (MB)", justify="right")
    table.add_column("Delimiter", justify="center")
    table.add_column("Standard FIRMS?", justify="center")
    table.add_column("Missing Cols", style="red")

    total_size_mb = 0.0

    for f in files:
        schema = inspect_csv_schema(f["file_path"])
        total_size_mb += f["file_size_mb"]
        table.add_row(
            f["country_code"],
            f["filename"],
            f"{f['file_size_mb']:.2f}",
            schema["delimiter"],
            "[YES]" if schema["is_standard_firms"] else "[NO]",
            ", ".join(schema["missing_columns"]) if schema["missing_columns"] else "None"
        )

    console.print(table)
    console.print(f"[bold]Total Raw Dataset Size:[/bold] {total_size_mb:.2f} MB (~{total_size_mb/1024:.2f} GB)")

@app.command()
def validate():
    """Validates database connection, PostGIS extension, and schema integrity."""
    setup_logging()
    console.print("[bold cyan]=== Database & Schema Validation ===[/bold cyan]")
    
    db = SessionLocal()
    try:
        from sqlalchemy import text
        postgis_ver = db.execute(text("SELECT PostGIS_Full_Version()")).scalar()
        console.print(f"[green][OK] PostGIS Extension:[/green] {postgis_ver}")
        
        c_count = db.query(Country).count()
        r_count = db.query(Region).count()
        f_count = db.query(FireDetection).count()
        file_count = db.query(IngestionFile).count()
        rej_count = db.query(RejectedRow).count()
        
        console.print(f"[green][OK] Countries registered:[/green] {c_count}")
        console.print(f"[green][OK] Monitoring Regions:[/green] {r_count}")
        console.print(f"[green][OK] Ingestion Files tracked:[/green] {file_count}")
        console.print(f"[green][OK] Fire Detections in DB:[/green] {f_count:,}")
        console.print(f"[green][OK] Rejected Rows recorded:[/green] {rej_count:,}")
    except Exception as e:
        console.print(f"[bold red]Validation error:[/bold red] {e}")
    finally:
        db.close()

@app.command()
def status():
    """Displays ingestion progress, file statuses, and record counts."""
    setup_logging()
    db = SessionLocal()
    try:
        files = db.query(IngestionFile).order_by(IngestionFile.id).all()
        table = Table(title="Ingestion Tracking Manifest")
        table.add_column("ID", justify="right")
        table.add_column("Country", style="cyan")
        table.add_column("Filename", style="green")
        table.add_column("Status", style="bold")
        table.add_column("Processed", justify="right")
        table.add_column("Inserted", justify="right")
        table.add_column("Skipped", justify="right")
        table.add_column("Rejected", justify="right")

        total_inserted = 0
        total_rejected = 0

        for f in files:
            total_inserted += f.rows_inserted
            total_rejected += f.rows_rejected
            color = "green" if f.status == "COMPLETED" else ("yellow" if f.status == "PROCESSING" else "red")
            table.add_row(
                str(f.id),
                f.country_code,
                f.filename,
                f"[{color}]{f.status}[/{color}]",
                f"{f.rows_processed:,}",
                f"{f.rows_inserted:,}",
                f"{f.rows_skipped:,}",
                f"{f.rows_rejected:,}"
            )

        console.print(table)
        console.print(f"[bold]Total Inserted Detections:[/bold] {total_inserted:,}")
        console.print(f"[bold]Total Rejected Rows:[/bold] {total_rejected:,}")
    finally:
        db.close()

@app.command()
def ingest(
    country: Optional[str] = typer.Option(None, "--country", "-c", help="Country code e.g. BRA, CAN, BR, CA"),
    all_files: bool = typer.Option(False, "--all", "-a", help="Ingest all discovered country files"),
    max_rows: Optional[int] = typer.Option(None, "--max-rows", "-m", help="Max rows per file (for testing/controlled batches)"),
    force: bool = typer.Option(False, "--force", "-f", help="Force re-importing already completed files")
):
    """Ingests satellite fire detection CSV files into PostgreSQL/PostGIS."""
    setup_logging()
    init_database()

    base_dirs = {}
    c_upper = country.upper() if country else ""
    if all_files:
        base_dirs = {"BRA": settings.DATASET_BRAZIL_PATH, "CAN": settings.DATASET_CANADA_PATH}
    elif c_upper in ("BR", "BRA", "BRAZIL"):
        base_dirs = {"BRA": settings.DATASET_BRAZIL_PATH}
    elif c_upper in ("CA", "CAN", "CANADA"):
        base_dirs = {"CAN": settings.DATASET_CANADA_PATH}
    else:
        console.print("[yellow]Please specify --country BRA, --country CAN, or --all[/yellow]")
        return

    files = discover_csv_files(base_dirs)
    if not files:
        console.print("[bold red]No files found to ingest![/bold red]")
        return

    console.print(f"[bold cyan]Starting ingestion of {len(files)} file(s)...[/bold cyan]")
    if max_rows:
        console.print(f"[yellow]Controlled batch mode: max {max_rows:,} rows per file[/yellow]")

    pipeline = IngestionPipeline()
    try:
        for f in files:
            res = pipeline.process_file(
                file_path=f["file_path"],
                country_code=f["country_code"],
                force_reimport=force,
                max_rows=max_rows
            )
            console.print(f"[green][OK] Finished {f['filename']}:[/green] {res}")
    finally:
        pipeline.close()

    console.print("[bold green]Ingestion complete![/bold green]")

if __name__ == "__main__":
    app()
