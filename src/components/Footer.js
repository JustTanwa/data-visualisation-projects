
function Footer() {
    const containerStyle = {
        display: "flex",
    }

    const iconStyle = {
        flexBasis: 50,
        color: "black",
        alignSelf: "center",
        marginRight: 10,
    }

    const nameStyle = {
        marginRight: 200, 
        paddingTop: 10,
        fontWeight: "600",
    }
    return (
        <footer>
            <div style={containerStyle}>
                <p style={nameStyle}>{new Date().getFullYear()} By Tanwa Sripan</p>
                <a
                    style={iconStyle}
                    href="https://www.facebook.com/sharer/sharer.php?u="
                    target="_blank"
                    role="button"
                ><i className="fab fa-facebook-f fa-xl"></i>
                </a>
                <a
                    href="https://twitter.com/intent/tweet?url="
                    role="button"
                    style={iconStyle}
                ><i className="fab fa-twitter fa-xl"></i>
                </a>
                <a
                    href="https://www.linkedin.com/in/tanwasripan/"
                    role="button"
                    style={iconStyle}
                ><i className="fab fa-linkedin fa-xl"></i>
                </a>
                <a
                    href="https://github.com/Katakung95"
                    role="button"
                    style={iconStyle}
                ><i className="fab fa-github fa-xl"></i>
                </a>
            </div>
        </footer>
    )
}

export default Footer;