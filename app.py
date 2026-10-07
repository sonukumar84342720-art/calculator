from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__)

# Calculation history
calculation_history = []


# Home page
@app.route("/")
def home():
    return send_from_directory(".", "index.html")


# Serve CSS and JS files
@app.route("/<path:filename>")
def serve_file(filename):
    return send_from_directory(".", filename)


# Calculate expression
@app.route("/calculate", methods=["POST"])
def calculate():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No calculation received."
            }), 400

        expression = data.get("expression", "").strip()

        if not expression:
            return jsonify({
                "success": False,
                "error": "Please enter a calculation."
            }), 400

        # Allowed calculator characters
        allowed_characters = "0123456789+-*/().% "

        if any(char not in allowed_characters for char in expression):
            return jsonify({
                "success": False,
                "error": "Invalid characters."
            }), 400

        # Check incomplete expression
        if expression[-1] in "+-*/.%":
            return jsonify({
                "success": False,
                "error": "Incomplete calculation."
            }), 400

        # Calculate
        result = eval(
            expression,
            {"__builtins__": None},
            {}
        )

        # Store history
        calculation_history.append({
            "expression": expression,
            "result": result
        })

        return jsonify({
            "success": True,
            "expression": expression,
            "result": result
        })

    except ZeroDivisionError:
        return jsonify({
            "success": False,
            "error": "Cannot divide by zero."
        }), 400

    except Exception:
        return jsonify({
            "success": False,
            "error": "Invalid calculation."
        }), 400


# Get calculation history
@app.route("/history", methods=["GET"])
def get_history():
    return jsonify({
        "success": True,
        "history": calculation_history
    })


# Clear history
@app.route("/history/clear", methods=["DELETE"])
def clear_history():
    calculation_history.clear()

    return jsonify({
        "success": True,
        "message": "History cleared."
    })


# Start Flask server
if __name__ == "__main__":
    app.run(debug=True)