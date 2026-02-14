'''name=bahar'
surname='aykut'
age=21

greeting='My name is'+name+''+surname+' and I am '+str(age)+'YEARS OLD'
lengt=len(greeting)
print(len(greeting))
print(greeting[1:10])
print(greeting[2:40:2]) 

print('my name is {} {}'.format(name,surname))

print(f"my name is {name} {surname} ")'''


website='http://www.sadikturan.com'
course="python kursu:baştan sona python programlama rehberiniz(40saat)"


'''#course karakter dizisinde ka. karakter bulunmaktadır

print(len(course))

#websitw içinden www karakterini alın
lenght=len(website)

print(website[7,10])

#website içinden com karakterlerini alın

print(website[lenght-3,lenght-1])

#course içinden ilk 15 ve son 15  karakterlerini alın

print(course[0:15])
print(course[-15:])

#course  ifadesindenki karakterlerin tersten yazdırın

print(course[::-1])
b

#String metotları

message="bahar aykut bilgisayar mühendisliği öğrencisi"

message=message.upper()#büyük harf
message=message.lower()#küçük harf
message=message.title()#her kelimenin baş harfi büyük
message=message.capitalize()#sadece cümlenin baş harfi büyük  olur
message=message.strip()#baş ve sondaki boşluk gider
message=message.split()^'''#her kelimeyi bir karakter olarak alıp diziye atatr''




website="http://www.sadikturan.com"
course="python kursu :baştan sona python programloama rehberiniz "


# ' hello world' karakter diboşluk karakterini silin zisinin baş ve sonraki 

message=" hello world"

message=message.strip()
result= website.lstrip('/:pth')
# wwww.sadikturan.com içindeki sadikturan bilgisi haricindeki her karakteri silin

result='www.sadikturan.com'.strip('w.moc')

#course  karakter dizisinin tüm karakterlerini küçük harf yapın

result=course.lower()

#website içinde kaç tane  a karakter vardır 
result =website.count('a')

# website www ile başlayıp comm ile bitiyor mu 

isfound=website.startswith('www').endswith('com')