export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <header
        style={{
          background: "#b91c1c",
          color: "#fff",
          padding: "20px"
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <h1 style={{ margin: 0 }}>📰 Hindi News</h1>

          <div>
            <button
              style={{
                background: "#fff",
                color: "#b91c1c",
                border: 0,
                padding: "8px 12px",
                borderRadius: "6px",
                marginRight: "6px"
              }}
            >
              हिंदी
            </button>

            <button
              style={{
                background: "transparent",
                color: "#fff",
                border: "1px solid #fff",
                padding: "8px 12px",
                borderRadius: "6px"
              }}
            >
              English
            </button>
          </div>
        </div>
      </header>

      <nav
        style={{
          background: "#fff",
          padding: "14px 20px",
          borderBottom: "1px solid #ddd"
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            gap: "20px",
            flexWrap: "wrap"
          }}
        >
          <span>होम</span>
          <span>भारत</span>
          <span>राजस्थान</span>
          <span>दुनिया</span>
          <span>बिज़नेस</span>
          <span>टेक्नोलॉजी</span>
          <span>खेल</span>
          <span>मनोरंजन</span>
        </div>
      </nav>

      <section
        style={{
          maxWidth: "1200px",
          margin: "30px auto",
          padding: "0 20px"
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "25px"
          }}
        >
          <p style={{ color: "#b91c1c", fontWeight: "bold" }}>
            🔴 BREAKING NEWS
          </p>

          <h2>आपकी नई हिंदी न्यूज़ वेबसाइट में आपका स्वागत है</h2>

          <p style={{ color: "#555", lineHeight: 1.7 }}>
            भारत, राजस्थान, दुनिया, बिज़नेस, टेक्नोलॉजी, खेल और मनोरंजन की
            ताज़ा खबरें यहाँ मिलेंगी।
          </p>
        </div>

        <div
          style={{
            background: "#e5e7eb",
            minHeight: "120px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "10px",
            marginBottom: "25px",
            color: "#666"
          }}
        >
          Advertisement Space
        </div>

        <h2>ताज़ा खबरें</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginTop: "20px"
          }}
        >
          {[
            "भारत की बड़ी खबरें",
            "राजस्थान की ताज़ा खबरें",
            "आज की टेक्नोलॉजी न्यूज़"
          ].map((title) => (
            <article
              key={title}
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
              }}
            >
              <div
                style={{
                  height: "140px",
                  background: "#ddd",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                News Image
              </div>

              <h3>{title}</h3>

              <p style={{ color: "#666" }}>
                इस जगह API से आने वाली वास्तविक खबर दिखाई जाएगी।
              </p>

              <button
                style={{
                  background: "#b91c1c",
                  color: "#fff",
                  border: 0,
                  padding: "10px 15px",
                  borderRadius: "6px"
                }}
              >
                और पढ़ें
              </button>
            </article>
          ))}
        </div>
      </section>

      <footer
        style={{
          background: "#111827",
          color: "#fff",
          padding: "30px 20px",
          marginTop: "50px",
          textAlign: "center"
        }}
      >
        <p>© 2026 Hindi News. All Rights Reserved.</p>
        <p>About Us · Contact · Privacy Policy · Disclaimer</p>
      </footer>
    </main>
  );
          }
                
