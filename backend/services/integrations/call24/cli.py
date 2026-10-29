import argparse
import json
from .adapter import parse_csv

def main():
    parser = argparse.ArgumentParser(description="Validate/preview Call 24 CSV; no database writes")
    parser.add_argument("file")
    parser.add_argument("--output")
    args = parser.parse_args()
    result = json.dumps(parse_csv(args.file).as_dict(), ensure_ascii=False, indent=2)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f: f.write(result + "\n")
    else: print(result)

if __name__ == "__main__": main()
