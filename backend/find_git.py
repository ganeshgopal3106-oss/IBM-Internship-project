import os
import sys

def find_git():
    common_paths = [
        r"C:\Program Files\Git\cmd\git.exe",
        r"C:\Program Files\Git\bin\git.exe",
        r"C:\Program Files (x86)\Git\cmd\git.exe",
        r"C:\Program Files (x86)\Git\bin\git.exe",
        os.path.expandvars(r"%LocalAppData%\Programs\Git\cmd\git.exe"),
        os.path.expandvars(r"%LocalAppData%\Programs\Git\bin\git.exe"),
    ]
    for path in common_paths:
        if os.path.exists(path):
            print(f"FOUND: {path}")
            return path
            
    # Search system PATH env variable
    for path_dir in os.environ.get("PATH", "").split(os.path.pathsep):
        git_path = os.path.join(path_dir, "git.exe")
        if os.path.exists(git_path):
            print(f"FOUND in PATH: {git_path}")
            return git_path
            
    # Search AppData
    appdata = os.environ.get("APPDATA", "")
    localappdata = os.environ.get("LOCALAPPDATA", "")
    for root_dir in [appdata, localappdata]:
        if root_dir:
            for root, dirs, files in os.walk(root_dir):
                if "git.exe" in files:
                    full_path = os.path.join(root, "git.exe")
                    print(f"FOUND in walk: {full_path}")
                    return full_path
                    
    print("NOT FOUND")
    return None

if __name__ == "__main__":
    find_git()
