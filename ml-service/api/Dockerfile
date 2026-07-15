# Build from the REPO ROOT context (see render.yaml: dockerContext: .)
# so this image can include models/ and artifacts/ without duplicating
# those files inside api/.
FROM python:3.11-slim

WORKDIR /app

COPY api/requirements.txt ./api/requirements.txt
RUN pip install --no-cache-dir -r api/requirements.txt

COPY api/ ./api/
COPY models/ ./models/
COPY artifacts/ ./artifacts/

WORKDIR /app/api
EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
