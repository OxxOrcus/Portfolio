import re

with open('js/script.js', 'r') as f:
    content = f.read()

# Function to generate safe SVG update logic
def generate_svg_logic(path_d):
    return f"""const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "w-6 h-6");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("viewBox", "0 0 24 24");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("d", "{path_d}");
        svg.appendChild(path);
        mobileMenuButton.replaceChildren(svg);"""

# Replace hamburger menu innerHTML
hamburger_html = """mobileMenuButton.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>`;"""

hamburger_replacement = generate_svg_logic("M4 6h16M4 12h16m-7 6h7")
content = content.replace(hamburger_html, hamburger_replacement, 1)

# Replace close menu innerHTML
close_html = """mobileMenuButton.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>`;"""

close_replacement = generate_svg_logic("M6 18L18 6M6 6l12 12")
content = content.replace(close_html, close_replacement)

# Replace the second hamburger menu innerHTML (in menuLinks click handler)
hamburger_html_2 = """mobileMenuButton.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>`;"""

hamburger_replacement_2 = f"""const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("class", "w-6 h-6");
          svg.setAttribute("fill", "none");
          svg.setAttribute("stroke", "currentColor");
          svg.setAttribute("viewBox", "0 0 24 24");
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("stroke-linecap", "round");
          path.setAttribute("stroke-linejoin", "round");
          path.setAttribute("stroke-width", "2");
          path.setAttribute("d", "M4 6h16M4 12h16m-7 6h7");
          svg.appendChild(path);
          mobileMenuButton.replaceChildren(svg);"""
content = content.replace(hamburger_html_2, hamburger_replacement_2)

with open('js/script.js', 'w') as f:
    f.write(content)
