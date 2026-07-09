from faker import Faker

fake = Faker("zh_CN")//"en_US"
print(fake.name())
print(fake.email())
print(fake.date())