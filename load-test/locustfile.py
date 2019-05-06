from locust import HttpLocust, TaskSet, events, task
import logging
import time

IMAGE_FILE = open("./image.jpg", "rb")
IMAGE_DATA = IMAGE_FILE.read()
IMAGE_FILE.close()
FILES = {"image": ("image.jpg", IMAGE_DATA)}


def create_logger():
    logger = logging.getLogger(__file__)
    file_handler = logging.FileHandler("requests.log", mode="w")
    formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")
    formatter.converter = time.gmtime
    formatter.datefmt = "%Y-%m-%d %H:%M:%S"
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    return logger


REQUEST_LOGGER = create_logger()


class UserBehavior(TaskSet):
    @task()
    def post_image(self):
        REQUEST_LOGGER.info("REQUEST")
        self.client.post("/", files=FILES, timeout=120)


class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait = 3000
    max_wait = 3000


def on_request_success(request_type, name, response_time, **kw):
    REQUEST_LOGGER.info(str(int(response_time)))


def on_request_failure(request_type, name, response_time, exception, **kw):
    REQUEST_LOGGER.error(str(exception))


events.request_success += on_request_success
events.request_failure += on_request_failure
