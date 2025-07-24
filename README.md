# EventShamer
### First iteration: v1
## Monitors keystrokes, mouseclicks and System Processes, as well as RAM and CPU usage.
---
## Ever wanted to get shamed by an AI for doing what you want to do?
> here's your solution 🧨

# Dependency Requirements
- <Python 3.10 and <PIP 23.3.1

# Installation Steps:
*oh boy, this is gonna be a MOUTHFUL.*
1. `npm i dotenv @google/generative-ai iohook-raub os-monitor play-sound ps-list`
2. Download RVC library [here](https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI/tree/main) 
3. Set up a venv in your project folder with `py -3.10 -m venv venv`
4. Run `pip install -r path\to\Retrieval-based-Voice-Conversion-WebUI\requirements.txt`
5. replace the utils.py in path\to\Retrieval-based-Voice-Conversion-WebUI\infer\modules\ with the one included here.
6. Get Hubert_base.pt [here](https://huggingface.co/lj1995/VoiceConversionWebUI/blob/main/hubert_base.pt) and place it in path\to\Retrieval-based-Voice-Conversion-WebUI\assets\hubert\
7. Get your RVC model from [here](https://www.weights.com/?isNewUser=true&callbackUrl=https%3A%2F%2Fwww.weights.com%2Fcreate%3FmodelId%3Dclmmvx9zy0035wsz75e22cow0)
8. Place your model.pth and model.index inside path\to\Retrieval-based-Voice-Conversion-WebUI\assets\weights
9. make your .env file. all it needs is your g_ApiKey which you can get [here](https://cloud.google.com/free?utm_source=google&utm_medium=cpc&utm_campaign=japac-PH-all-en-dr-BKWS-all-core-trial-EXA-dr-1710102&utm_content=text-ad-none-none-DEV_c-CRE_602400826262-ADGP_Hybrid+%7C+BKWS+-+EXA+%7C+Txt+-GCP-General-Core+Brand-KWID_43700071562408553-kwd-26415313501&userloc_1011174-network_g&utm_term=KW_google+cloud+platform&gclsrc=aw.ds&gad_source=1&gad_campaignid=12297519333&gclid=Cj0KCQjwkILEBhDeARIsAL--pjyvDquuDsY136JYciILCjjnrgIEkfOdQn7E2jEmvasefcS1LpOqH2kaAqqqEALw_wcB).
10. it's now time to edit some directories inside index.js and infer_rvc.py.

### Editing Directories.

You must change this into the installation folder of your RVC library
<img width="574" height="30" alt="image" src="https://github.com/user-attachments/assets/72f9c33b-2bfa-46ad-a884-af213bd458f5" />

You must also change this into their corresponding directories
<img width="856" height="174" alt="image" src="https://github.com/user-attachments/assets/5543e5aa-4643-475c-b201-552fea00cea5" />

<img width="397" height="200" alt="image" src="https://github.com/user-attachments/assets/8e54cbee-164e-4e4f-a175-d2745782ec59" />
removing MODEL_NAME and INDEX_PATH from the list of variables to declutter will work as only the one in rvc_cmd is used.
### Some Finalizations:
- Install ffmpeg and dotenv with pip.

