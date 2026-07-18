import random
from datetime import datetime, timedelta
import json
import os

safe_ips = [
    "10.0.0.5",
    "10.0.0.6",
    "10.0.0.7",
    "10.0.0.8"
]

attackers = [
    "192.168.1.20",
    "192.168.1.21",
    "192.168.1.22"
]

users = [
    "root",
    "admin",
    "ubuntu",
    "guest",
    "user"
]

current_time = datetime(2026, 7, 17, 14, 0, 0)
logs = []

for ip in safe_ips:
    for i in range(5):

        username = random.choice(users)

        port = random.randint(50000, 60000)

        log = f"{current_time.strftime('%b %d %H:%M:%S')} server sshd[{1000+i}]: Accepted password for {username} from {ip} port {port} ssh2"

        logs.append(log)

        current_time += timedelta(seconds=random.randint(5,15))

for ip in attackers:

    failures = random.randint(6,8)

    for i in range(failures):

        username = random.choice(users)

        port = random.randint(50000,60000)

        log = f"{current_time.strftime('%b %d %H:%M:%S')} server sshd[{2000+i}]: Failed password for {username} from {ip} port {port} ssh2"

        logs.append(log)

        current_time += timedelta(seconds=random.randint(2,8))


edge_ip = "192.168.1.30"

for i in range(5):

    username = random.choice(users)

    port = random.randint(50000,60000)

    log = f"{current_time.strftime('%b %d %H:%M:%S')} server sshd[{3000+i}]: Failed password for {username} from {edge_ip} port {port} ssh2"

    logs.append(log)

    current_time += timedelta(seconds=random.randint(2,8))

random.shuffle(logs)
os.makedirs("data", exist_ok=True)

with open("data/access.log", "w") as file:
    for log in logs:
        file.write(log + "\n")

safe_data = {
    "safe_ips": safe_ips
}

with open("data/safe-ips.json", "w") as file:
    json.dump(safe_data, file, indent=4)

print("SSH log generated successfully!")
print("File: data/access.log")
print("File: data/safe-ips.json")
