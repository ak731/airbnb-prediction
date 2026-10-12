# StayWise AI - Airbnb Price Predictor

An intelligent Machine Learning web application designed to predict Airbnb rental prices across global destinations using Decision Tree Regression and historical booking trends.

---

## 🌟 Features

- **Accurate Price Estimation**: Predict nightly rental prices based on location, room type, accommodations, bedrooms, bathrooms, and guest capacity.
- **Multi-City Support**: Tailored predictions and currency formatting for major cities including New York, Paris, Rome, Sydney, Bangkok, and more.
- **Interactive UI**: Responsive web dashboard with interactive sliders, inputs, and real-time calculation.
- **Fast Parquet Data Loading**: Optimized dataset handling using Apache Parquet for high-performance model training and inference.
- **REST API Endpoints**: Flask backend serving prediction and dataset metrics endpoints.

---

## 📂 Project Structure

```text
├── design/                          # UI design references and assets
│   └── stitch_staywise_ai_price_predictor/
├── kouta abhi/                      # Core application folder
│   ├── dataset/                     # Airbnb datasets (Parquet and Excel)
│   ├── static/                      # Static assets (CSS, JS, images)
│   │   ├── css/
│   │   ├── images/
│   │   └── js/
│   ├── templates/                   # HTML templates (Jinja2)
│   │   └── index.html
│   └── server.py                    # Flask backend & ML model pipeline
├── .gitignore                       # Git ignore file
└── README.md                        # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites

- Python 3.9+
- pip (Python package manager)

### 2. Installation

Clone this repository:
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd "kouta abhi"
```

Install the dependencies:
```bash
pip install flask flask-cors numpy pandas scikit-learn pyarrow
```

### 3. Running the Server

Navigate to the project folder and start the Flask server:
```bash
cd "kouta abhi"
python server.py
```

Open your browser and visit:
```text
http://127.0.0.1:5000
```

---

## 🛠️ Built With

- **Python & Flask** - Backend framework & REST API
- **Scikit-Learn, Pandas & NumPy** - Machine learning pipeline and data processing
- **HTML5, CSS3, JavaScript** - Frontend interface
