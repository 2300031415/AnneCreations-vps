import paramiko
import json

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:5000/api/orders')
    output = stdout.read().decode('utf-8', errors='ignore')
    
    try:
        data = json.loads(output)
        orders = data.get('data', []) if isinstance(data, dict) else data
        if orders:
            order = orders[0]
            print(f"Order ID: {order.get('_id')}")
            print(f"Total Amount: {order.get('totalAmount')}")
            print(f"TOTAL FIELD: {order.get('total')}")
        else:
            print("No orders found.")
    except Exception as e:
        print("Failed to parse JSON:", e)
        print("Output was:", output[:500])

    ssh.close()

if __name__ == "__main__":
    main()
