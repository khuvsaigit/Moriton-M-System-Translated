"""Validate checked-in JSON Schemas and OpenAPI documents."""
from pathlib import Path
import json
import yaml
from jsonschema import Draft202012Validator
from openapi_spec_validator import validate_spec


ROOT = Path(__file__).resolve().parents[1]


def main():
    for path in sorted((ROOT / "contracts").rglob("*.json")):
        document = json.loads(path.read_text(encoding="utf-8"))
        if "$schema" in document:
            Draft202012Validator.check_schema(document)
        print(f"JSON OK {path.relative_to(ROOT)}")
    for path in sorted((ROOT / "contracts").rglob("*.yaml")):
        document = yaml.safe_load(path.read_text(encoding="utf-8"))
        validate_spec(document)
        print(f"OpenAPI OK {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
