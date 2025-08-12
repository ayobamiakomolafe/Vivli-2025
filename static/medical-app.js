// Medical RAG Application React Component
const { useState, useEffect, useRef } = React;

const MedicalRagApp = () => {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [recommendation, setRecommendation] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [isPlaceholder, setIsPlaceholder] = useState(true);
    const textareaRef = useRef(null);

    const defaultText =
        "e.g. What is the best antibiotic for a 45-year-old with community-acquired pneumonia in South Africa?";

    useEffect(() => {
        // Set default text when component mounts - placeholder mode
        setQuery(defaultText);
        setIsPlaceholder(true);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate input - don't allow submission if it's still placeholder
        if (isPlaceholder || !query.trim() || query === defaultText) {
            setError(
                "Please enter a clinical question or scenario to get a recommendation.",
            );
            return;
        }

        // Clear previous states
        setError("");
        setShowResults(false);
        setIsLoading(true);

        try {
            const response = await fetch("/get_recommendation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query: query }),
            });

            const data = await response.json();

            if (data.success) {
                setRecommendation(data.answer);
                setShowResults(true);
                // Scroll to results
                setTimeout(() => {
                    const resultsSection =
                        document.getElementById("resultsSection");
                    if (resultsSection) {
                        resultsSection.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                        });
                    }
                }, 100);
            } else {
                setError(data.error);
            }
        } catch (error) {
            console.error("Error:", error);
            setError(
                "Network error occurred. Please check your connection and try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextareaFocus = () => {
        if (isPlaceholder) {
            // Clear placeholder and enable editing
            setQuery("");
            setIsPlaceholder(false);
        }
    };

    const handleTextareaBlur = () => {
        if (!query.trim()) {
            // Restore placeholder if empty
            setQuery(defaultText);
            setIsPlaceholder(true);
        }
    };

    const handleTextareaChange = (e) => {
        if (!isPlaceholder) {
            setQuery(e.target.value);
            setError(""); // Clear error when user starts typing
        }
    };

    const handleTextareaKeyDown = (e) => {
        if (isPlaceholder) {
            // Allow typing to replace placeholder
            if (
                e.key.length === 1 ||
                e.key === "Backspace" ||
                e.key === "Delete"
            ) {
                setQuery("");
                setIsPlaceholder(false);
            }
        }
    };

    const formatRecommendation = (answer) => {
        // Split answer into main content and sources
        const parts = answer.split("\n\nRelevant Sources:\n");
        let mainContent = parts[0];
        const sources = parts[1] || "";

        // Remove ** formatting from the content
        mainContent = mainContent.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>",
        );

        let formatted = `<div class="mb-3"><strong>Recommendation:</strong></div>`;
        formatted += `<div class="mb-4">${mainContent.replace(/\n/g, "<br>")}</div>`;

        if (sources) {
            formatted += `<div class="border-top pt-3">`;
            formatted += `<div class="mb-2"><strong>Relevant Sources:</strong></div>`;

            // Format sources as a list
            const sourceLines = sources
                .split("\n")
                .filter((line) => line.trim());
            sourceLines.forEach((line) => {
                if (line.trim().startsWith("- ")) {
                    const sourceText = line.substring(2); // Remove "- "
                    formatted += `<div class="source-item">${sourceText}</div>`;
                }
            });
            formatted += `</div>`;
        }

        return formatted;
    };

    return (
        <div>
            {/* App Header - Fixed at Top */}
            <header className="app-header bg-white shadow-sm border-bottom sticky-top">
                <div className="container-fluid">
                    <div className="row align-items-center py-2 py-md-3">
                        <div className="col-12 col-md">
                            <div className="d-flex align-items-center">
                                <i
                                    className="fas fa-dna text-primary me-2 me-md-3"
                                    style={{ fontSize: "1.75rem" }}
                                ></i>
                                <div>
                                    <h1 className="h5 h4-md mb-0 text-primary fw-bold">
                                        SPARS
                                    </h1>
                                    <small className="text-muted">
                                        Surveillance-Powered Antimicrobial
                                        Recommendation System
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-auto mt-2 mt-md-0">
                            <div className="d-flex align-items-start text-muted small">
                                <span className="d-block">
                                    <strong className="d-block d-md-inline">
                                        AMR Surveillance Databases from:
                                    </strong>
                                    <span className="d-block d-md-inline">
                                        {" "}
                                        GSK • Pfizer ATLAS • Johnson & Johnson •
                                        Paratek • Shionogi • Venatorx • Innoviva
                                        • Venus Remedies
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container" style={{ paddingTop: "2rem" }}>
                {/* Introduction */}
                <div className="row justify-content-center mb-4">
                    <div className="col-12">
                        <div className="text-center">
                            <p className="lead text-muted">
                                This empirical recommendation system predicts
                                the most appropriate empirical antibiotics for
                                patients, using only the provided medical
                                context.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="card shadow-lg border-0">
                            <div className="card-body p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label
                                            htmlFor="clinicalQuery"
                                            className="form-label fw-bold"
                                        >
                                            <i className="fas fa-stethoscope me-2"></i>
                                            Enter your clinical question or
                                            patient scenario:
                                        </label>
                                        <textarea
                                            ref={textareaRef}
                                            className={`form-control form-control-lg ${error ? "is-invalid" : ""}`}
                                            id="clinicalQuery"
                                            rows="6"
                                            value={query}
                                            onChange={handleTextareaChange}
                                            onFocus={handleTextareaFocus}
                                            onBlur={handleTextareaBlur}
                                            onKeyDown={handleTextareaKeyDown}
                                            onTouchStart={handleTextareaFocus}
                                            style={{
                                                color: isPlaceholder
                                                    ? "#6c757d"
                                                    : "#333",
                                                fontStyle: isPlaceholder
                                                    ? "italic"
                                                    : "normal",
                                                minHeight: "120px",
                                                resize: "vertical",
                                            }}
                                            readOnly={isPlaceholder}
                                            required
                                        />
                                        {error && (
                                            <div className="invalid-feedback">
                                                {error}
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-grid">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg"
                                            disabled={
                                                isLoading || isPlaceholder
                                            }
                                        >
                                            {isLoading ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin me-2"></i>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-search me-2"></i>
                                                    Get Antibiotic
                                                    Recommendation
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="row justify-content-center mt-4">
                        <div className="col-12">
                            <div className="alert alert-info text-center">
                                <div
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </div>
                                Consulting medical knowledge base...
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="row justify-content-center mt-4">
                        <div className="col-12">
                            <div className="alert alert-danger" role="alert">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                {error}
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                {showResults && (
                    <div
                        className="row justify-content-center mt-4"
                        id="resultsSection"
                    >
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-light border-0">
                                    <h5 className="card-title mb-0">
                                        <i className="fas fa-pills me-2 text-primary"></i>
                                        Recommendation
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div
                                        className="recommendation-content"
                                        dangerouslySetInnerHTML={{
                                            __html: formatRecommendation(
                                                recommendation,
                                            ),
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="row justify-content-center mt-5">
                    <div className="col-12">
                        <hr />
                        <p className="text-center text-muted small">
                            <i className="fas fa-robot me-2"></i>
                            Powered by LangChain, Vivli AMR Data Catalogue and
                            your custom medical knowledge base.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Render the app using createRoot (React 18+)
const container = document.getElementById("react-root");
const root = ReactDOM.createRoot(container);
root.render(<MedicalRagApp />);
