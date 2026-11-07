# /// script
# requires-python = ">=3.11"
# dependencies = ["openpyxl"]
# ///
"""
Extract per-paper review outcomes from the working-group spreadsheet into src/data/records.json.

Usage:
    uv run scripts/extract_records.py "/path/to/YIR VAHC AMIA 2026.xlsx"

Only bibliographic fields and review outcomes are exported; reviewer comments stay in the spreadsheet.
"""
import json
import re
import sys
from pathlib import Path

import openpyxl

FULL_SHEET = "2026 (Full Review)"
TOP_SHEET = "TO BE REVIEWED TOP 11"
OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "records.json"


def first_round_included(value) -> bool:
    """Initial Review is 1/0, sometimes with a note, e.g. "1(got access thro' institution)" or "????? 1 ?????"."""
    s = str(value or "").strip()
    return bool(re.match(r"^\D*1(\.0)?\b", s))


def parse_score(value):
    """Second Review looks like "2+3+2=7" (Novelty + Importance + Presentability)."""
    m = re.match(r"\s*(\d)\s*\+\s*(\d)\s*\+\s*(\d)\s*=\s*(\d+)", str(value or ""))
    if not m:
        return None
    n, i, p, total = map(int, m.groups())
    return {"novelty": n, "importance": i, "presentability": p, "total": total}


def main(xlsx: str) -> None:
    wb = openpyxl.load_workbook(xlsx, data_only=True)
    top_pmids = {int(r[2]) for r in wb[TOP_SHEET].iter_rows(min_row=2, values_only=True) if r[2]}
    records = []
    for r in wb[FULL_SHEET].iter_rows(min_row=2, values_only=True):
        if not r[2]:
            continue
        pmid = int(r[2])
        journal = str(r[7])
        included = first_round_included(r[0])
        score = parse_score(r[1]) if included else None
        if pmid in top_pmids:
            stage = 3  # shortlisted for group review
        elif score:
            stage = 2  # full text scored
        elif included:
            stage = 1  # passed title/abstract (full-text excluded or pending)
        else:
            stage = 0  # excluded at title/abstract
        records.append(
            {
                "pmid": pmid,
                "title": str(r[3]).strip(),
                "authors": str(r[4]).strip(),
                "firstAuthor": str(r[6]).strip(),
                "journal": journal,
                "year": int(r[8]),
                "doi": r[12],
                "venue": "TVCG" if "IEEE" in journal else "Informatics",
                "stage": stage,
                "uncertain": "?" in str(r[0] or ""),
                # Full-text outcome for papers that passed round 1: scored, excluded, or not yet scored.
                "fulltext": None if not included else ("scored" if score else ("excluded" if r[1] else "pending")),
                "score": score,
            }
        )
    missing = top_pmids - {x["pmid"] for x in records}
    if missing:
        sys.exit(f"Top papers missing from {FULL_SHEET}: {missing}")
    OUT.write_text(json.dumps(records, indent=1, ensure_ascii=False) + "\n")
    counts = [sum(1 for x in records if x["stage"] >= s) for s in range(4)]
    print(f"Wrote {len(records)} records to {OUT}; stage counts (>= stage) = {counts}")


if __name__ == "__main__":
    main(sys.argv[1])
