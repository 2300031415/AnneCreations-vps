import os

def update_envs():
    base_path = r"d:\AnneCreations-2\FinalVersion-Annecreations-main"
    
    envs = {
        os.path.join(base_path, "Frontend", ".env"): {
            "NEXT_PUBLIC_API_URL": "http://localhost:5000",
            "NEXT_PUBLIC_IMAGE_URL": "http://localhost:5000"
        },
        os.path.join(base_path, "annecreation-admin-main", "annecreation-admin-main", ".env"): {
            "NEXT_PUBLIC_API_URL": "http://localhost:5000"
        },
        os.path.join(base_path, "brochure", ".env"): {
            "NEXT_PUBLIC_API_URL": "http://localhost:5000",
            "NEXT_PUBLIC_IMAGE_URL": "http://localhost:5000"
        }
    }
    
    for path, changes in envs.items():
        if not os.path.exists(path):
            print(f"File not found: {path}")
            continue
            
        with open(path, 'r') as f:
            lines = f.readlines()
            
        new_lines = []
        updated_keys = set()
        for line in lines:
            key_val = line.strip().split('=', 1)
            if len(key_val) == 2:
                key = key_val[0].strip()
                if key in changes:
                    new_lines.append(f"{key}={changes[key]}\n")
                    updated_keys.add(key)
                    continue
            new_lines.append(line)
            
        # Add keys that weren't in the file
        for key, val in changes.items():
            if key not in updated_keys:
                new_lines.append(f"{key}={val}\n")
        
        with open(path, 'w') as f:
            f.writelines(new_lines)
        print(f"Updated {path}")

if __name__ == "__main__":
    update_envs()
