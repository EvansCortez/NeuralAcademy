from fastapi.testclient import TestClient

from main import app
from sandbox import run_student_code


client = TestClient(app)


def test_status_endpoint():
    response = client.get("/status")
    assert response.status_code == 200
    payload = response.json()
    assert payload["name"] == "NeuralAcademy"
    assert payload["ready"] is True


def test_generate_study_sheet_without_api_key():
    response = client.post(
        "/generate-study-sheet",
        json={"text": "Sorting algorithms organize data efficiently in memory."},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["main_idea"]
    assert isinstance(payload["sections"], list)


def test_run_code_success():
    result = run_student_code("print('hello')")
    assert result["status"] == "success"
    assert "hello" in result["output"]


def test_run_code_syntax_error():
    result = run_student_code("def broken(")
    assert result["status"] == "error"
