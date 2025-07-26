from flask import Blueprint, request, jsonify
from services.extractor import extract_text_from_pdf
from models.document_model import insert_document

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        file_content = file.read()  # Read once
        file.seek(0)  # Reset file pointer just in case
        extracted_text, metadata = extract_text_from_pdf(file)  # Unpack both text & metadata

        # Insert into DB
        doc_id = insert_document(
            name=file.filename,
            file_type=file.content_type,
            size=len(file_content),  # Use the actual content length
            extracted_text=extracted_text,
            metadata=metadata
        )

        return jsonify({
            "message": "File uploaded and processed successfully",
            "document_id": doc_id
        }), 200

    return jsonify({"error": "Something went wrong"}), 500
