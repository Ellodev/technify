FROM python:3.12-slim

WORKDIR /app

RUN groupadd -r technify && useradd -r -g technify technify

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

RUN mkdir -p /data && chown technify:technify /data
ENV DATA_DIR=/data
VOLUME /data

USER technify
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/healthz')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
