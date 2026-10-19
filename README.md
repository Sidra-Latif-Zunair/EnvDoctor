# EnvDoctor
A CLI that diagnoses why environment variables are missing, checks .env paths and names, and explains likely configuration problems without exposing secret values.


How to Test EnvDoctor

Run Unit Tests: Execute npm test to verify that environment variables are parsed correctly and missing or empty variables are detected.

Create Sample Files: Create a demo folder containing .env and .env.example files with sample environment variables, including an empty variable and a missing variable.

Run EnvDoctor: Execute node src/index.js --dir demo to check the sample files and confirm that EnvDoctor reports the expected issues.

Test CLI Commands: Run node src/index.js --help to verify the help instructions and try an invalid option to test error handling.

Test the Installed Command: Run npm link, then execute envdoctor --dir demo to verify that the CLI works as a command.

Verify Results: Confirm that all tests pass, the detected issues are accurate, and no actual environment variable values or secrets are exposed.

Expected Result: EnvDoctor should identify missing .env files, variables missing from .env, and empty variable values without revealing sensitive information.
