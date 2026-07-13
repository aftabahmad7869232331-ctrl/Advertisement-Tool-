# Local Wan Dependency Profile

The default AI worker remains cloud-capable and lightweight. Local Wan runtime
dependencies are optional:

```powershell
apps\ai-worker\.venv\Scripts\python.exe -m pip install -e "apps\ai-worker[local-wan,dev]"
```

On Windows without NVIDIA CUDA, PyPI installs a CPU Torch build. This is useful
for import and compatibility checks but is not a practical video-generation
runtime. Commercial NVIDIA installations must install the PyTorch wheel that
matches the machine's supported CUDA runtime before installing this extra.

Model checkpoints are not Python dependencies and must remain outside Git.
Configure their existing location through `WAN_MODEL_PATH`.

Configure the extracted official source directory through `WAN_ENGINE_PATH`.
It must contain `generate.py`, `requirements.txt`, and the `wan/` package.

The official Wan engine source or a supported Diffusers pipeline is still
required for actual local inference. Never treat successful dependency imports
as proof that video generation is ready; `/health` must also confirm CUDA and
the model path.
