// Dashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaDownload,
  FaTrash,
  FaTachometerAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import logo from "../assets/logo.png";

const Dashboard = () => {
  const [detections, setDetections] = useState([]);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) {
      navigate("/");
    }
    fetchDetections();
  }, []);

  const fetchDetections = () => {
    setLoading(true);
    axios.get("https://ngultrum-classifier.onrender.com/detections").then((res) => {
      if (res.data.success) setDetections(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const deleteImage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      const res = await axios.delete(
        `https://ngultrum-classifier.onrender.com/detections/${id}`
      );
      if (res.data.success) {
        setDetections((prev) => prev.filter((item) => item.id !== id));
      } else {
        console.error("Delete failed:", res.data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  const filteredDetections =
    filter === "all"
      ? detections
      : detections.filter((d) => d.classes.includes(filter));

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredDetections.slice(indexOfFirst, indexOfLast);

  const pageCount = Math.ceil(filteredDetections.length / itemsPerPage);

  const classLabels = Array.from(
    new Set(detections.flatMap((item) => item.classes))
  );

  const downloadImage = (image, filename) => {
    const a = document.createElement("a");
    a.href = `data:image/jpeg;base64,${image}`;
    a.download = filename;
    a.click();
  };

  const downloadAll = () => {
    window.open("https://ngultrum-classifier.onrender.com/download-zip");
  };

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <div className="nav-item active">
          <FaTachometerAlt /> <span>Dashboard</span>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-logo">
            <img src={logo} alt="Logo" className="login-logo" />
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </header>

        <h2 className="section-title">User Inputs</h2>

        <div className="filter-row">
          <button
            onClick={() => setFilter("all")}
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
          >
            All
          </button>
          {classLabels.map((label) => (
            <button
              key={label}
              onClick={() => setFilter(label)}
              className={`filter-btn ${filter === label ? "active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : (
          <>
            <div className="record-list">
              {currentItems.map((item) => (
                <div key={item.id} className="record-card">
                  <div className="record-image">
                    <img
                      src={`data:image/jpeg;base64,${item.image}`}
                      alt="Detected"
                    />
                    <div className="icon-overlay">
                      <FaDownload
                        className="icon-button"
                        onClick={() =>
                          downloadImage(item.image, `${item.id}.jpg`)
                        }
                      />
                      <FaTrash
                        className="icon-button"
                        onClick={() => deleteImage(item.id)}
                      />
                    </div>
                  </div>
                  <div className="record-info">
                    <p>Denomination:</p>
                    <strong>Nu.{item.classes.join(", ")}</strong>
                  </div>
                  <p className="timestamp">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="pagination">
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i + 1}
                  className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button className="download-all-btn" onClick={downloadAll}>
              Download All by Class
            </button>
          </>
        )}

        <footer className="footer">
          © 2025 Ngultrum Classification | All rights reserved
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;