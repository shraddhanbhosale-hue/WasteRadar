from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests
import os


load_dotenv()


app = FastAPI(
    title="WasteRadar AI Service",
    description="AI service for waste detection, classification and severity estimation",
    version="2.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")

ROBOFLOW_MODEL_ID = os.getenv(
    "ROBOFLOW_MODEL_ID",
    "yolo-waste-detection-9ebbc-dss8p-1-yolov11n-t1"
)

ROBOFLOW_URL = (
    "https://serverless.roboflow.com/"
    "yolo-waste-detection-9ebbc-dss8p/1"
)

CONFIDENCE_THRESHOLD = 0.70


WASTE_CLASS_MAPPING = {
    "Aluminum can": "Other",
    "Cardboard": "Paper",
    "Container for household chemicals": "Other",
    "Glass bottle": "Other",
    "Organic": "Organic",
    "Paper": "Paper",
    "Plastic bag": "Plastic",
    "Plastic bottle": "Plastic",
    "Plastic cup": "Plastic",
    "Tin": "Other",
}


@app.get("/")
def root():
    return {
        "message": "WasteRadar AI Service is running 🚀",
        "status": "healthy",
        "model": ROBOFLOW_MODEL_ID,
        "confidenceThreshold": CONFIDENCE_THRESHOLD,
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "WasteRadar AI Service",
    }


def calculate_severity(confidence: float, detection_count: int):

    if detection_count >= 4 or confidence >= 0.90:
        return "High"

    if detection_count >= 2 or confidence >= 0.80:
        return "Medium"

    return "Low"


def analyze_with_roboflow(image_bytes: bytes):

    if not ROBOFLOW_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="ROBOFLOW_API_KEY is not configured."
        )

    try:

        response = requests.post(
            ROBOFLOW_URL,
            params={
                "confidence": CONFIDENCE_THRESHOLD,
                "overlap": 0.5,
            },
            headers={
                "Authorization": f"Bearer {ROBOFLOW_API_KEY}",
            },
            files={
                "file": (
                    "image.jpg",
                    image_bytes,
                    "image/jpeg"
                ),
            },
            timeout=60,
        )

    except requests.exceptions.Timeout:

        raise HTTPException(
            status_code=504,
            detail="Roboflow AI service timed out."
        )

    except requests.exceptions.RequestException as error:

        print(
            f"Roboflow connection error: {error}"
        )

        raise HTTPException(
            status_code=503,
            detail="Unable to connect to Roboflow AI service."
        )


    print(
        "Roboflow status:",
        response.status_code
    )


    if response.status_code != 200:

        print(
            "ROBOFLOW RESPONSE:",
            response.text
        )

        raise HTTPException(
            status_code=502,
            detail=(
                f"Roboflow error "
                f"{response.status_code}: "
                f"{response.text}"
            )
        )


    try:

        result = response.json()

    except Exception:

        print(
            "Invalid Roboflow response:",
            response.text
        )

        raise HTTPException(
            status_code=502,
            detail="Invalid response received from Roboflow."
        )


    predictions = result.get(
        "predictions",
        []
    )


    valid_predictions = []


    for prediction in predictions:

        try:

            confidence = float(
                prediction.get(
                    "confidence",
                    0
                )
            )

        except (TypeError, ValueError):

            continue


        class_name = prediction.get(
            "class",
            ""
        )


        if not class_name:
            continue


        class_name = class_name.strip()


        if confidence < CONFIDENCE_THRESHOLD:
            continue


        if class_name not in WASTE_CLASS_MAPPING:
            continue


        valid_predictions.append(
            {
                "class": class_name,
                "confidence": confidence,
            }
        )


    if not valid_predictions:

        return {
            "wasteDetected": False,
            "confidence": 0.0,
            "wasteType": "Other",
            "severity": "Low",
            "detectedClass": None,
            "detections": [],
        }


    valid_predictions.sort(
        key=lambda item: item["confidence"],
        reverse=True
    )


    best_prediction = valid_predictions[0]


    detected_class = best_prediction["class"]


    confidence = best_prediction["confidence"]


    waste_type = WASTE_CLASS_MAPPING.get(
        detected_class,
        "Other"
    )


    severity = calculate_severity(
        confidence,
        len(valid_predictions)
    )


    detections = []


    for prediction in valid_predictions:

        detections.append(
            {
                "class": prediction["class"],
                "wasteType": WASTE_CLASS_MAPPING.get(
                    prediction["class"],
                    "Other"
                ),
                "confidence": round(
                    prediction["confidence"],
                    3
                ),
            }
        )


    return {
        "wasteDetected": True,
        "confidence": round(
            confidence,
            3
        ),
        "wasteType": waste_type,
        "severity": severity,
        "detectedClass": detected_class,
        "detections": detections,
    }


@app.post("/api/ai/analyze")
async def analyze_waste(
    image: UploadFile = File(...)
):

    allowed_types = {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
    }


    if image.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image file."
        )


    image_bytes = await image.read()


    if not image_bytes:

        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty."
        )


    max_size = 10 * 1024 * 1024


    if len(image_bytes) > max_size:

        raise HTTPException(
            status_code=400,
            detail="Image size must be less than 10 MB."
        )


    result = analyze_with_roboflow(
        image_bytes
    )


    return result


if __name__ == "__main__":

    import uvicorn


    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8002,
        reload=False,
    )