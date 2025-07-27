from flask import Blueprint, request, jsonify
from services.extractor import extract_text_from_pdf
from models.document_model import insert_document, get_document_by_id, serialize_document

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        file_content = file.read()  # Read file contents
        file.seek(0)  # Reset pointer
        extracted_text, metadata = extract_text_from_pdf(file)  # Text + metadata

        # Insert into database
        doc_id = insert_document(
            name=file.filename,
            file_type=file.content_type,
            size=len(file_content),
            extracted_text=extracted_text,
            metadata=metadata
        )

        # Fetch and serialize full document
        doc = get_document_by_id(doc_id)
        return jsonify(serialize_document(doc)), 200

    return jsonify({"error": "Something went wrong"}), 500
