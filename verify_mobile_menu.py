from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a small viewport to trigger mobile menu
        page = browser.new_page(viewport={'width': 375, 'height': 812})
        page.goto("http://localhost:3000/")

        # Click the mobile menu button
        button = page.locator("#mobile-menu-button")

        # Verify initial SVG state
        initial_path = button.locator("svg path").get_attribute("d")
        print(f"Initial path d: {initial_path}")

        button.click()

        # Wait a moment for transitions
        page.wait_for_timeout(500)

        # Verify opened SVG state
        opened_path = button.locator("svg path").get_attribute("d")
        print(f"Opened path d: {opened_path}")

        # Verify menu is visible
        menu = page.locator("#mobile-menu")
        is_visible = menu.is_visible()
        print(f"Menu visible after click: {is_visible}")

        # Click to close
        button.click()
        page.wait_for_timeout(500)

        # Verify closed SVG state
        closed_path = button.locator("svg path").get_attribute("d")
        print(f"Closed path d: {closed_path}")
        is_visible_closed = menu.is_visible()
        print(f"Menu visible after second click: {is_visible_closed}")

        browser.close()

verify()
