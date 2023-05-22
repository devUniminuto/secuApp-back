from tkinter import * 
import socketio
import threading
import json
from detMov import *

class GuiApp(object):
  def __init__(self):
    self.root = Tk()
    self.root.geometry('500x500')
    self.frameReadersRFID = None
    self.pathAccionante = None
    self.sio = None
    self.idConexion = StringVar()
    #self.text_wid = Text(self.root,height=100,width=100)
    #self.text_wid.pack(expand=1,fill=BOTH)
    #self.root.after(100,self.CheckQueuePoll,q)
    
  
  def connect(self):
    print("I'm connected!")
    self.joinServer()
    
  def client_activatedesactivateCamera(self, data):
    with open("status.json", "w") as j:
      print(data)
      json.dump({"status": data['status']}, j)
    print('Activate Read in! ', data)
    
  def server_activateReadOut(self, data):
    print('Activate Read Out! ', data)

  def joinServer(self):
    print(self.idConexion.get())
    self.sio.emit("server_join_camera", { "idChat":self.idConexion.get() })

  def makeConnection(self):
    self.sio = socketio.Client()
    self.sio.event(self.connect)
    self.sio.connect('http://localhost:9000', wait_timeout = 10) 
    
    self.sio.event(self.client_activatedesactivateCamera)
    self.sio.wait()
    
          
  def on_connect(self):
    t2 = threading.Thread(target=lambda: self.makeConnection())
    t2.start()
    t2 = threading.Thread(target=lambda: initMovement(self.sio, self.idConexion.get()))
    t2.start()
    
  def createWindow(self):
    self.root.title("SecuApp") #Cambiar el nombre de la ventana 
    self.root.geometry("520x480") #Configurar tamaño

    
    Label(self.root, text="Código de habitación").pack()
    idConexionTextEntry = Entry(self.root, justify=CENTER, textvariable=self.idConexion)
    #idConexionTextEntry.insert(0, self.configFile['idConexion'])
    idConexionTextEntry.pack()

    botonGuardarLector = Button(self.root, text="Iniciar proceso de Lectura", command=lambda: self.on_connect())
    botonGuardarLector.pack()
    # botonGuardarLector = Button(self.root, text="Conectar", command=lambda: joinServer())
    # botonGuardarLector.pack()

    self.root.mainloop() 
    
GuiApp().createWindow()