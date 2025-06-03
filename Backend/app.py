from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
import zipfile
import io
import base64
from datetime import datetime
import utils
from bson import ObjectId




app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient("mongodb+srv://12210088gcit:m6rVDh6FLY61OBNt@clusterngultrum.nuziaej.mongodb.net/?retryWrites=true&w=majority&appName=ClusterNgultrum")
db = client["object_detection"]
collection = db["detections"]

@app.route("/")
def index():
    return "YOLOv8 OBB Detection API Running"

@app.route("/detections/<string:detection_id>", methods=["DELETE"])
def delete_detection(detection_id):
    try:
        result = collection.delete_one({"_id": ObjectId(detection_id)})
        if result.deleted_count == 1:
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "message": "No document found"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route("/download-zip", methods=["GET"])
def download_zip():
    try:
        records = list(collection.find().sort("timestamp", -1))  # Get all
        class_map = {}

        for idx, r in enumerate(records):
            for cls in r["predicted_classes"]:
                if cls not in class_map:
                    class_map[cls] = []
                filename = f"image_{idx+1}.jpg"
                image_bytes = base64.b64decode(r["image_base64"])
                class_map[cls].append((filename, image_bytes))

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
            for class_name, files in class_map.items():
                for filename, data in files:
                    zipf.writestr(f"{class_name}/{filename}", data)

        zip_buffer.seek(0)
        return send_file(zip_buffer, mimetype="application/zip", as_attachment=True, download_name="classified_images.zip")

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route("/detections", methods=["GET"])
def get_detections():
    try:
        records = list(collection.find().sort("timestamp", -1).limit(50))
        results = []
        for r in records:
            results.append({
                "id": str(r["_id"]),
                "image": r["image_base64"],
                "classes": r["predicted_classes"],
                "timestamp": r["timestamp"].isoformat()
            })
        return jsonify({"success": True, "data": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        image_b64 = data["image"]

        # Decode image
        pil_img = utils.decode_base64_image(image_b64)

        # Run detection
        results = utils.model.predict(pil_img, task="obb", imgsz=640)

        # Get class names
        predicted_classes = []
        if results and results[0].obb and results[0].obb.cls.numel() > 0:
            for cls in results[0].obb.cls:
                predicted_classes.append(utils.model.names[int(cls)])
        else:
            predicted_classes.append("No Detection")

        # Plot image with boxes
        plotted_img = results[0].plot()  # Draw boxes on image
        processed_b64 = utils.encode_image_to_base64(plotted_img)

        # Save to MongoDB
        collection.insert_one({
            "image_base64": image_b64,
            "predicted_classes": predicted_classes,
            "timestamp": datetime.utcnow()
        })

        return jsonify({"success": True, "boxed_image": processed_b64})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
