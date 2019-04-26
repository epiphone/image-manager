from google.cloud import storage
from locust import HttpLocust, TaskSet, events, task
import time
import uuid


class UserBehavior(TaskSet):
    @task()
    def upload_image_to_bucket(self):
        t0 = time.time()
        try:
            bucket = storage.Client().get_bucket("imgmgr-images")
            blob = bucket.blob(str(uuid.uuid4()) + "-image.jpg")
            with open("./image.jpg", "rb") as f:
                blob.upload_from_file(f, num_retries=6, content_type="image/jpg")

            time.sleep(2)
            if not blob.exists():
                raise Exception("Blob upload failed")

            events.request_success.fire(
                request_type="google.cloud.storage",
                name="upload_from_filename",
                response_time=int((time.time() - t0) * 1000),
                response_length=0,
            )
        except Exception as e:
            print(e)
            events.request_failure.fire(
                request_type="google.cloud.storage",
                name="upload_from_filename",
                response_time=int((time.time() - t0) * 1000),
                exception=e,
            )
            raise e


class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait = 3000
    max_wait = 3000
