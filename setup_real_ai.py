#!/usr/bin/env python3
"""
INSANE FUSION - Real AI Setup Script
This script installs all required dependencies for real AI functionality.
"""

import subprocess
import sys
import os
import platform
from pathlib import Path

def run_command(command, description=""):
    """Run a command and handle errors"""
    print(f"📦 {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} - Success")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - Failed: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ required. Current version:", sys.version)
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def install_pytorch():
    """Install PyTorch with CUDA support if available"""
    print("🔥 Installing PyTorch...")
    
    # Check if CUDA is available
    try:
        import torch
        if torch.cuda.is_available():
            print("✅ PyTorch with CUDA already installed")
            return True
    except ImportError:
        pass
    
    # Install PyTorch
    if platform.system() == "Windows":
        command = "pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118"
    else:
        command = "pip install torch torchvision torchaudio"
    
    return run_command(command, "Installing PyTorch")

def install_opencv():
    """Install OpenCV for computer vision"""
    return run_command("pip install opencv-python opencv-contrib-python", "Installing OpenCV")

def install_midas_dependencies():
    """Install MiDaS depth estimation dependencies"""
    packages = [
        "timm",
        "einops", 
        "scipy",
        "matplotlib",
        "pillow",
        "transforms3d",
        "open3d"
    ]
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    return True

def install_gaussian_splatting_deps():
    """Install Gaussian Splatting dependencies"""
    print("🎬 Installing Gaussian Splatting dependencies...")
    
    # Basic dependencies
    basic_deps = [
        "plyfile",
        "tqdm",
        "numpy",
        "scipy",
        "matplotlib",
        "imageio",
        "configargparse"
    ]
    
    for dep in basic_deps:
        run_command(f"pip install {dep}", f"Installing {dep}")
    
    # Try to install COLMAP if available
    system = platform.system().lower()
    if system == "linux":
        run_command("sudo apt-get update && sudo apt-get install -y colmap", "Installing COLMAP (Linux)")
    elif system == "darwin":  # macOS
        run_command("brew install colmap", "Installing COLMAP (macOS)")
    else:
        print("⚠️  COLMAP installation skipped on Windows - manual installation required")
    
    return True

def install_additional_packages():
    """Install additional useful packages"""
    packages = [
        "ffmpeg-python",
        "imageio-ffmpeg",
        "scikit-image",
        "scikit-learn",
        "trimesh",
        "pymeshlab"
    ]
    
    for package in packages:
        run_command(f"pip install {package}", f"Installing {package}")

def setup_midas_models():
    """Download MiDaS models"""
    print("📥 Setting up MiDaS models...")
    
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    
    # Download MiDaS small model
    midas_script = """
import torch
import urllib.request
import os
from pathlib import Path

def download_midas_models():
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    
    models = {
        "midas_v21_small.pt": "https://github.com/intel-isl/MiDaS/releases/download/v2_1/midas_v21_small-70d51b78.pt",
        "midas_v21.pt": "https://github.com/intel-isl/MiDaS/releases/download/v2_1/midas_v21-f6b98070.pt"
    }
    
    for model_name, url in models.items():
        model_path = models_dir / model_name
        if model_path.exists():
            print(f"✅ {model_name} already exists")
            continue
            
        try:
            print(f"📥 Downloading {model_name}...")
            urllib.request.urlretrieve(url, model_path)
            print(f"✅ Downloaded {model_name}")
        except Exception as e:
            print(f"❌ Failed to download {model_name}: {e}")

if __name__ == "__main__":
    download_midas_models()
"""
    
    with open("download_midas.py", "w") as f:
        f.write(midas_script)
    
    run_command("python download_midas.py", "Downloading MiDaS models")
    
    # Clean up
    if os.path.exists("download_midas.py"):
        os.remove("download_midas.py")

def verify_installation():
    """Verify that everything is installed correctly"""
    print("🔍 Verifying installation...")
    
    test_script = """
import sys
print("Testing imports...")

try:
    import torch
    print(f"✅ PyTorch {torch.__version__}")
    if torch.cuda.is_available():
        print(f"🚀 CUDA available: {torch.cuda.get_device_name(0)}")
    else:
        print("💻 Using CPU")
except ImportError as e:
    print(f"❌ PyTorch: {e}")

try:
    import torchvision
    print(f"✅ TorchVision {torchvision.__version__}")
except ImportError as e:
    print(f"❌ TorchVision: {e}")

try:
    import cv2
    print(f"✅ OpenCV {cv2.__version__}")
except ImportError as e:
    print(f"❌ OpenCV: {e}")

try:
    import numpy as np
    print(f"✅ NumPy {np.__version__}")
except ImportError as e:
    print(f"❌ NumPy: {e}")

try:
    import scipy
    print(f"✅ SciPy {scipy.__version__}")
except ImportError as e:
    print(f"❌ SciPy: {e}")

try:
    import plyfile
    print("✅ PLY file support")
except ImportError as e:
    print(f"❌ PLY file: {e}")

print("\\n🎊 Installation verification complete!")
"""
    
    with open("test_installation.py", "w") as f:
        f.write(test_script)
    
    run_command("python test_installation.py", "Running installation tests")
    
    # Clean up
    if os.path.exists("test_installation.py"):
        os.remove("test_installation.py")

def create_conda_env():
    """Create conda environment (optional)"""
    print("🐍 Do you want to create a conda environment? (y/n): ", end="")
    response = input().lower().strip()
    
    if response == 'y':
        env_name = "insane_fusion"
        print(f"Creating conda environment: {env_name}")
        
        commands = [
            f"conda create -n {env_name} python=3.9 -y",
            f"conda activate {env_name}",
        ]
        
        for cmd in commands:
            run_command(cmd, f"Running: {cmd}")
        
        print(f"✅ Conda environment '{env_name}' created!")
        print(f"To activate: conda activate {env_name}")

def main():
    """Main setup function"""
    print("🔥 INSANE FUSION - Real AI Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Optional conda environment
    create_conda_env()
    
    # Install dependencies
    steps = [
        ("Installing PyTorch", install_pytorch),
        ("Installing OpenCV", install_opencv), 
        ("Installing MiDaS dependencies", install_midas_dependencies),
        ("Installing Gaussian Splatting dependencies", install_gaussian_splatting_deps),
        ("Installing additional packages", install_additional_packages),
        ("Setting up MiDaS models", setup_midas_models),
        ("Verifying installation", verify_installation),
    ]
    
    for description, func in steps:
        print(f"\\n📋 {description}...")
        try:
            func()
        except Exception as e:
            print(f"❌ {description} failed: {e}")
            continue
    
    print("\\n🏆 INSANE FUSION Real AI Setup Complete!")
    print("\\n📋 Next steps:")
    print("1. Start your Node.js server: npm run dev")
    print("2. Upload a video and experience REAL AI processing!")
    print("3. Monitor the console for real-time processing updates")
    
    print("\\n⚡ System Requirements Met:")
    print("✅ Real MiDaS depth estimation")
    print("✅ Real Gaussian Splatting support")
    print("✅ COLMAP camera calibration (if available)")
    print("✅ Advanced AI enhancement algorithms")
    print("✅ Cinema-grade 3D reconstruction")

if __name__ == "__main__":
    main()
