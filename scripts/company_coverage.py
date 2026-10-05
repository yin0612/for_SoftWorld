"""One company registry for browser rows, collection queries and source audits."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COMPANIES = json.loads((ROOT / 'config/company_coverage.json').read_text(encoding='utf-8'))['companies']


def browser_config():
    return ('// Generated from config/company_coverage.json by scripts/company_coverage.py.\n'
            'const COVERAGE_COMPANIES = ' + json.dumps(COMPANIES, ensure_ascii=False, indent=2) + ';\n')


if __name__ == '__main__':
    path = ROOT / 'js/coverage-companies.js'
    if '--check' in sys.argv:
        if path.read_text(encoding='utf-8') != browser_config():
            raise SystemExit('Company browser configuration differs from registry; regenerate it.')
    else:
        path.write_text(browser_config(), encoding='utf-8')
