import cv2
import numpy as np
import datetime as dt
import json
import requests


def initMovement(sio, idConexion):
  print("Iniciando...")
  
  video = cv2.VideoCapture(0)
  path = 'movements/'
  tiempoA = dt.datetime.now()

  i = 0
  while True:
    ret, frame = video.read()
    if ret == False: break
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    if i == 20:
      bgGray = gray
    if i > 20:
      tiempoB = dt.datetime.now()
      tiempoTranscurrido = tiempoB - tiempoA
      if(tiempoTranscurrido.seconds >= 10):
        imagePath = path + dt.datetime.now().strftime('IMG-%Y-%m-%d-%H%M%S') + '.jpg'
        cv2.imwrite(imagePath, frame)
        tiempoTranscurrido = 0
        tiempoA = dt.datetime.now()  
        with open('status.json') as file:
          data = json.load(file)
          if(data['status']):
            sio.emit("server_MovementDetected", { })
            url_endpoint = "http://localhost:9000/api/move"
            with open(imagePath, 'rb') as archivo:
              archivos = {'image': archivo} 
              datos = {'idRoom': idConexion}
              respuesta = requests.post(url_endpoint, files=archivos, data=datos)
              print(respuesta)
    
      
      dif = cv2.absdiff(gray, bgGray)
      _, th = cv2.threshold(dif, 40, 255, cv2.THRESH_BINARY)
      # Para OpenCV 3
      #_, cnts, _ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
      # Para OpenCV 4
      cnts, _ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
      #cv2.drawContours(frame, cnts, -1, (0,0,255),2)		
      
      for c in cnts:
        area = cv2.contourArea(c)
        if area > 9000:
          x,y,w,h = cv2.boundingRect(c)
          cv2.rectangle(frame, (x,y), (x+w,y+h),(0,255,0),2)

    cv2.imshow('Frame',frame)

    i = i+1
    if cv2.waitKey(30) & 0xFF == ord ('q'):
      break
  video.release()

  