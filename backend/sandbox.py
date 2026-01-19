import subprocess
import sys
import tempfile
import os


def run_student_code(code_text: str):
    """
    Execute student code in a sandboxed environment
    """
    try:
        # Create a temporary file for the code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code_text)
            temp_file = f.name

        # Run the code with timeout and restricted environment
        result = subprocess.run(
            [sys.executable, temp_file],
            capture_output=True,
            text=True,
            timeout=10,  # 10 second timeout
            env={'PYTHONPATH': '', 'PATH': '/usr/bin:/bin'}  # Restricted environment
        )

        # Clean up
        os.unlink(temp_file)

        output = result.stdout
        error = result.stderr

        if result.returncode != 0:
            return {
                "status": "error",
                "output": output,
                "error": error,
                "code_preview": code_text[:100],
            }
        else:
            return {
                "status": "success",
                "output": output,
                "error": error,
                "code_preview": code_text[:100],
            }

    except subprocess.TimeoutExpired:
        return {
            "status": "timeout",
            "output": "",
            "error": "Code execution timed out (10 seconds)",
            "code_preview": code_text[:100],
        }
    except Exception as e:
        return {
            "status": "error",
            "output": "",
            "error": f"Execution failed: {str(e)}",
            "code_preview": code_text[:100],
        }
