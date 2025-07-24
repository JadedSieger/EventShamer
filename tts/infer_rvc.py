import os
import sys
import subprocess

TEXT = sys.argv[1].replace('"', '\\"')
MODEL_NAME = "model.pth"
MODEL_PATH = f"tts/models/{MODEL_NAME}.pth"
INDEX_PATH = f"tts/models/{MODEL_NAME}.index"
OUTPUT_PATH = "C:/Programming/EventShamer/tts/output/yuura_final.wav"
BASE_TTS_PATH = "C:/Programming/EventShamer/tts/temp.wav"
HUBERT_MODEL_PATH = "C:/Programming/Retrieval-based-Voice-Conversion-WebUI/assets/hubert/hubert_base.pt"
INFER_CLI_PATH = "C:/Programming/Retrieval-based-Voice-Conversion-WebUI/tools/infer_cli.py"

# 1. Generate base voice with Edge TTS
edge_cmd = f'edge-tts --text "{TEXT}" --write-media "{BASE_TTS_PATH}" --voice en-US-AriaNeural'
print(f"Running base TTS:\n{edge_cmd}")
subprocess.run(edge_cmd, shell=True)

# 2. Run RVC voice conversion
rvc_cmd = (
    f'python {INFER_CLI_PATH} '
    f'--input_path "{BASE_TTS_PATH}" '
    f'--opt_path "{OUTPUT_PATH}" '
    f'--model_name model.pth '
    f'--index_path "assets/weights/model.index" '
    f'--f0method harvest '
    f'--index_rate 0.75'
)

print(f"Running RVC conversion:\n{rvc_cmd}")
subprocess.run(rvc_cmd, shell=True)

print(f"Done. Output saved to: {OUTPUT_PATH}")
