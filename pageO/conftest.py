import pytest
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options


@pytest.fixture(scope="function")
def driver():
    """初始化浏览器 - 适配Jenkins无桌面环境"""
    options = Options()
    options.binary_location = r"D:\Google\Chrome\Application\chrome.exe"

    # ===== 无头模式配置 =====
    # 尝试两种方式，兼容不同Chrome版本
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-software-rasterizer")

    # ===== Jenkins必需参数 =====
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-setuid-sandbox")
    options.add_argument("--disable-blink-features=AutomationControlled")

    # ===== 窗口和显示配置 =====
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--window-position=0,0")
    options.add_argument("--start-maximized")

    # ===== 禁用不必要的功能 =====
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-infobars")
    options.add_argument("--disable-images")
    options.add_argument("--disable-background-networking")
    options.add_argument("--disable-default-apps")
    options.add_argument("--disable-sync")
    options.add_argument("--metrics-recording-only")
    options.add_argument("--mute-audio")
    options.add_argument("--no-first-run")

    # ===== 性能优化 =====
    options.add_argument("--disable-hang-monitor")
    options.add_argument("--disable-prompt-on-repost")
    options.add_argument("--disable-popup-blocking")
    options.add_argument("--disable-translate")
    options.add_argument("--safebrowsing-disable-auto-update")

    # ===== User-Agent =====
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

    # ===== 实验性参数 =====
    options.add_argument("--disable-features=VizDisplayCompositor")
    options.add_argument("--disable-background-timer-throttling")
    options.add_argument("--disable-backgrounding-occluded-windows")
    options.add_argument("--disable-renderer-backgrounding")

    # ===== ChromeDriver 配置 =====
    service = Service(executable_path=r"D:\ChromeDriver\chromedriver-win64\chromedriver.exe")
    service.log_path = os.path.devnull  # 禁用driver日志

    driver = webdriver.Chrome(service=service, options=options)

    # 设置超时
    driver.set_page_load_timeout(30)
    driver.set_script_timeout(30)
    driver.implicitly_wait(10)

    yield driver
    driver.quit()
