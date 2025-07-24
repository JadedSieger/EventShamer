import os

from fairseq import checkpoint_utils
import torch.serialization 
from fairseq.data.dictionary import Dictionary

def get_index_path_from_model(sid):
    return next(
        (
            f
            for f in [
                os.path.join(root, name)
                for root, _, files in os.walk(os.getenv("index_root"), topdown=False)
                for name in files
                if name.endswith(".index") and "trained" not in name
            ]
            if sid.split(".")[0] in f
        ),
        "",
    )


def load_hubert(config):
    # 🛡️ Allow safe unpickling of the HuBERT model
    torch.serialization.add_safe_globals([Dictionary])

    # 📦 Load HuBERT model
    models, _, _ = checkpoint_utils.load_model_ensemble_and_task(
        ["assets/hubert/hubert_base.pt"],
        suffix="",
        strict=False  # <-- Optional: loosen strict matching
    )
    hubert_model = models[0]
    hubert_model = hubert_model.to(config.device)
    if config.is_half:
        hubert_model = hubert_model.half()
    else:
        hubert_model = hubert_model.float()
    return hubert_model.eval()
