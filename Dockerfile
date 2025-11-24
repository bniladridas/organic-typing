FROM node:18

RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN python3 -m venv /opt/venv && /opt/venv/bin/pip install -r core/model/requirements.txt

EXPOSE 3000

CMD ["bash", "-c", "source /opt/venv/bin/activate && npx ts-node ux/github-app/server.ts"]
