import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def run_cmd(ssh, cmd):
    print(f"Executing: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out, err

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    # 1. Check Dashboard Service on VPS
    out, _ = run_cmd(ssh, "cat /var/www/annecreations/Backend/src/modules/dashboard/dashboard.service.ts")
    print("DASHBOARD SERVICE ON VPS:")
    print(out[-1000:]) # Last 1000 chars

    # 2. Check Order Service mapOrderForFrontend on VPS
    out, _ = run_cmd(ssh, "cat /var/www/annecreations/Backend/src/modules/orders/orders.service.ts | grep -A 20 'mapOrderForFrontend'")
    print("ORDER SERVICE MAPPER ON VPS:")
    print(out)

    # 3. Check Admin .env on VPS
    out, _ = run_cmd(ssh, "cat /var/www/annecreations/Admin/.env")
    print("ADMIN .ENV ON VPS:")
    print(out)

    ssh.close()

if __name__ == "__main__":
    main()
