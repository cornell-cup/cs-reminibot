using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using UnityEngine.Networking;

public class Move : MonoBehaviour, IPointerDownHandler, IPointerUpHandler
{
    public GameObject tank;
    public Button button;
    public float m_Speed;
    public float direction;
    bool isPressed = false;
    private bool justPressed = false;
    private float time_since_request = 0.1f;
    private int stopRequests = 5;
    private string address;
    string url;
    string command;

    private Rigidbody tank_rigidbody;

    // Start is called before the first frame update
    void Start()
    {
        tank_rigidbody = tank.GetComponent<Rigidbody>();
        address = MainMenu.ipAddress;
        Debug.Log(address);
        url = "http://" + address + ":5000/move";
        
        switch (direction)
        {
            case 1:
                command = "forward";
                break;
            case 2:
                command = "right";
                break;
            case -1:
                command = "backward";
                break;
            case -2:
                command = "left";
                break;
        }
    }

    public void Update()
    {
        time_since_request += Time.deltaTime;
        string body;
        

        if (isPressed)
        {
            Debug.Log(direction);
            body = "{ \"direction\": \"" + command + "\" }";

            if (time_since_request >= 0.05f)
            {
                time_since_request = 0;
                StartCoroutine(Post(url, body));
            }

            if (System.Math.Abs(direction) == 1)
            {
                Vector3 movement = tank.transform.forward * m_Speed * Time.deltaTime * direction;
                Debug.Log(tank.transform.forward);
                tank_rigidbody.MovePosition(tank_rigidbody.position + movement);
            } else
            {
                float turn = 10 * direction * m_Speed * Time.deltaTime;
                Quaternion turnRotation = Quaternion.Euler(0f, turn, 0f);
                tank_rigidbody.MoveRotation(tank_rigidbody.rotation * turnRotation);
            }
        }
        else
        {
            body = "{ \"direction\": \"stop\" }";
            if (time_since_request >= 0.05f && stopRequests < 3)
            {
                time_since_request = 0;
                StartCoroutine(Post(url, body));
                stopRequests++;
            }
        }
    }

    IEnumerator Post(string url, string data)
    {
        var request = new UnityWebRequest(url, "POST");
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(data);
        request.uploadHandler = (UploadHandler)new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = (DownloadHandler)new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        Debug.Log("Status Code: " + request.responseCode);
    }

    public void OnPointerDown(PointerEventData eventData) 
    {
        isPressed = true;
    }

    public void OnPointerUp(PointerEventData eventData)
    {
        isPressed = false;
        stopRequests = 0;
    }
}
