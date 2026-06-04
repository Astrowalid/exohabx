FROM node:20-slim AS build-stage
WORKDIR /app/frontend
COPY exoplanet-habitability-simulator/package*.json ./
RUN npm install
COPY exoplanet-habitability-simulator/ ./
RUN npm run build

FROM python:3.10-slim
WORKDIR /app

COPY exoplanet-api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY exoplanet-api/ ./

COPY --from=build-stage /app/frontend/dist ./static

ENV PORT=7860
EXPOSE 7860

CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--workers", "2", "--timeout", "120", "app:app"]