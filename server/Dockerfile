FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /home/app

# Install postgresql-client for wait script
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /home/app/

RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . /home/app

# Make wait script executable
RUN chmod +x wait-for-db.sh

EXPOSE 8000

CMD ["sh", "-c", "./wait-for-db.sh db sh -c 'python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8000'"]
