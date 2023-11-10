import cv2
import numpy as np
import datetime as dt
import json
import requests
import time


def initMovement(sio, idConexion):
  print("Iniciando...")
  
  video = cv2.VideoCapture(0)
  path = 'movements/'
  tiempoA = dt.datetime.now()
  fourcc = None
  out = None
  
  
  videoGrabar = False
  tiempoGrabacion = 20 #Segundos
  start_time = time.time()
  videoPath = ""
  idMovement = 0

  i = 0
  while True:
    ret, frame = video.read()
    if(videoGrabar == False):
      if ret == False: break
      gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
      if i == 20:
        bgGray = gray
      if i > 20:
        tiempoB = dt.datetime.now()
        tiempoTranscurrido = tiempoB - tiempoA
        if(tiempoTranscurrido.seconds >= 10):
          
          with open('status.json') as file:
            data = json.load(file)
            if(data['status']):
              
              sio.emit("server_MovementDetected", { })
              
              imagePath = path + dt.datetime.now().strftime('IMG-%Y-%m-%d-%H%M%S') + '.jpg'
              cv2.imwrite(imagePath, frame)
              tiempoTranscurrido = 0
              tiempoA = dt.datetime.now()  
              url_endpoint = "http://localhost:9000/api/move"
              with open(imagePath, 'rb') as archivo:
                archivos = {'image': archivo} 
                datos = {'idRoom': idConexion}
                respuesta = requests.post(url_endpoint, files=archivos, data=datos)
                print(json.loads(respuesta.text)['idMovement'])
                idMovement = json.loads(respuesta.text)['idMovement']

              
              videoGrabar = True
              start_time = time.time()
              fourcc = cv2.VideoWriter_fourcc(*'mp4v')
              videoPath = 'movementsVideo/'+dt.datetime.now().strftime('IMG-%Y-%m-%d-%H%M%S')+'.mp4'
              out = cv2.VideoWriter(videoPath, fourcc, 20.0, (640,480))
              
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
    else:

      # write the flipped frame
      out.write(frame)

      if(int(time.time() - start_time) >= tiempoGrabacion):

        out.release()
        
        
        url_endpoint = "http://localhost:9000/api/moveVideo"
        with open(videoPath, 'rb') as archivoVideo:
          archivos = {'video': archivoVideo} 
          datos = {'idMovement': idMovement}
          respuesta = requests.post(url_endpoint, files=archivos, data=datos)

        
        videoGrabar = False
        tiempoA = dt.datetime.now()  
      #if cv2.waitKey(1) & 0xFF == ord('q'):
      #    break
      
     
      
      

    cv2.imshow('Frame',frame)

    i = i+1
    if cv2.waitKey(30) & 0xFF == ord ('q'):
      break
  video.release()

  