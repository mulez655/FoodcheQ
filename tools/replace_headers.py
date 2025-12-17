import os
import re

ROOT = r"c:\Users\Admin1\Desktop\New Project\FoodCheQ"
HEADER_SNIPPET = '''<header>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <!-- Logo -->
      <a class="navbar-brand" href="#">
        <img src="https://foodcheq.coop/upload/eSio9fKkSKNFqEeGkq6kRnJDhaFpE1.png" alt="logo" class="logo" />
      </a>

      <!-- Hamburger toggle (mobile only) -->
      <button class="navbar-toggler d-lg-none" type="button"
              data-bs-toggle="offcanvas" data-bs-target="#mobileMenu"
              aria-controls="mobileMenu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Desktop nav links -->
      <div class="collapse navbar-collapse d-none d-lg-flex" id="navbarNavDropdown">
        <ul class="navbar-nav ms-auto">
          <!-- Dropdown stays for desktop -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="menuDropdown"
               role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Menu
            </a>
            <ul class="dropdown-menu" aria-labelledby="menuDropdown">
              <li><a class="dropdown-item" href="index.html">Home</a></li>
              <li><a class="dropdown-item" href="about.html">About</a></li>
              <li><a class="dropdown-item" href="product-category.html">Shop</a></li>
              <li><a class="dropdown-item" href="sample.html">Request Sample</a></li>
            </ul>
          </li>

          <!-- Other desktop links -->
          <li class="nav-item"><a class="nav-link special-link" href="login.html">REQUEST <br> LOGISTICS</a></li>
          <li class="nav-item"><a class="nav-link special-link" href="track-shipment.html">TRACK <br> SHIPMENT</a></li>
          <li class="nav-item"><a class="nav-link special-link" href="register.html">BECOME A <br> PARTNER</a></li>
        </ul>

        <!-- Header icons -->
        <div class="header-icons d-flex align-items-center ms-lg-3">
          <a href="#" data-bs-toggle="offcanvas" data-bs-target="#searchOffcanvas"><i class="fa-solid fa-magnifying-glass"></i></a>
          <a href="login.html"><i class="fa-solid fa-user"></i></a>
          <a href="cart.html" class="position-relative"><i class="fa-solid fa-cart-shopping"></i>
            <span id="cartCount" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">0</span>
          </a>
        </div>
      </div>
    </div>
  </nav>
</header>

<!-- Mobile offcanvas menu -->
<div class="offcanvas offcanvas-start d-lg-none" tabindex="-1" id="mobileMenu">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title">Menu</h5>
    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body">
    <ul class="navbar-nav">
      <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
      <li class="nav-item"><a class="nav-link" href="about.html">About</a></li>
      <li class="nav-item"><a class="nav-link" href="product-category.html">Shop</a></li>
      <li class="nav-item"><a class="nav-link" href="sample.html">Request Sample</a></li>
      <li class="nav-item"><a class="nav-link" href="login.html">Request Logistics</a></li>
      <li class="nav-item"><a class="nav-link" href="track-shipment.html">Track Shipment</a></li>
      <li class="nav-item"><a class="nav-link" href="register.html">Become a Partner</a></li>
    </ul>
  </div>
</div>
'''


def find_offcanvas_end(s, start_pos):
    # Find matching closing </div> for the offcanvas starting at start_pos
    pattern = re.compile(r'<div\b|</div>')
    depth = 0
    for m in pattern.finditer(s, start_pos):
        token = m.group(0)
        if token.startswith('<div'):
            depth += 1
        else:
            depth -= 1
            if depth == 0:
                return m.end()
    return None


modified = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    for fn in filenames:
        if not fn.lower().endswith('.html'):
            continue
        filepath = os.path.join(dirpath, fn)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        header_idx = content.find('<header')
        if header_idx == -1:
            continue
        # Try to find offcanvas block after header
        off_idx = content.find('<div class="offcanvas', header_idx)
        if off_idx != -1:
            end_idx = find_offcanvas_end(content, off_idx)
            if end_idx is None:
                # fallback: find closing </div> after off_idx
                end_idx = content.find('</div>', off_idx)
                if end_idx != -1:
                    end_idx = end_idx + len('</div>')
                else:
                    continue
            replace_from = header_idx
            replace_to = end_idx
        else:
            # No offcanvas found; try to replace just header..</header>
            close_header = content.find('</header>', header_idx)
            if close_header == -1:
                continue
            replace_from = header_idx
            replace_to = close_header + len('</header>')

        new_content = content[:replace_from] + HEADER_SNIPPET + content[replace_to:]
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            modified.append(os.path.relpath(filepath, ROOT))

print('Modified files:')
for m in modified:
    print(m)
print(f'Total modified: {len(modified)}')
