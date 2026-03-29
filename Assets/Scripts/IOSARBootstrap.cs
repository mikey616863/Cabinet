using System.Collections;
using UnityEngine;
using UnityEngine.XR.ARFoundation;

public class IOSARBootstrap : MonoBehaviour
{
    [Header("AR References")]
    [SerializeField] private ARSession arSession;
    [SerializeField] private GameObject xrOriginRoot;

    [Header("Desktop / Non-AR Fallback")]
    [SerializeField] private GameObject nonARRoot;
    [SerializeField] private Camera nonARCamera;

    [Header("Optional Fallback UI")]
    [SerializeField] private GameObject permissionOrUnsupportedPanel;

    [Header("Behavior")]
    [SerializeField] private bool requestCameraPermissionOnIOS = true;

    private IEnumerator Start()
    {
        ResolveReferences();

        SetFallbackVisible(false);
        SetAREnabled(false);
        SetNonAREnabled(false);

    #if !UNITY_IOS || UNITY_EDITOR
        ActivateNonARMode();
        yield break;
    #endif

#if UNITY_IOS && !UNITY_EDITOR
        if (!Application.HasUserAuthorization(UserAuthorization.WebCam))
        {
            if (!requestCameraPermissionOnIOS)
            {
                ShowFallbackAndStop();
                yield break;
            }

            yield return Application.RequestUserAuthorization(UserAuthorization.WebCam);
        }

        if (!Application.HasUserAuthorization(UserAuthorization.WebCam))
        {
            ShowFallbackAndStop();
            yield break;
        }
#endif

        yield return ARSession.CheckAvailability();

        if (ARSession.state == ARSessionState.NeedsInstall)
        {
            yield return ARSession.Install();
        }

        if (ARSession.state == ARSessionState.Unsupported)
        {
            ActivateNonARMode();
            yield break;
        }

        ActivateARMode();

        if (arSession != null)
        {
            arSession.Reset();
        }
    }

    private void ResolveReferences()
    {
        if (arSession == null)
        {
            arSession = FindObjectOfType<ARSession>();
        }

        if (xrOriginRoot == null && arSession != null)
        {
            xrOriginRoot = arSession.gameObject;
        }
    }

    private void SetAREnabled(bool enabled)
    {
        if (arSession != null)
        {
            arSession.enabled = enabled;
        }

        if (xrOriginRoot != null)
        {
            xrOriginRoot.SetActive(enabled);
        }
    }

    private void SetNonAREnabled(bool enabled)
    {
        if (nonARRoot != null)
        {
            nonARRoot.SetActive(enabled);
        }

        if (nonARCamera != null)
        {
            nonARCamera.enabled = enabled;
            AudioListener audioListener = nonARCamera.GetComponent<AudioListener>();
            if (audioListener != null)
            {
                audioListener.enabled = enabled;
            }
        }
    }

    private void SetFallbackVisible(bool visible)
    {
        if (permissionOrUnsupportedPanel != null)
        {
            permissionOrUnsupportedPanel.SetActive(visible);
        }
    }

    private void ShowFallbackAndStop()
    {
        SetAREnabled(false);
        SetFallbackVisible(true);
        Debug.LogWarning("IOSARBootstrap: AR disabled because camera permission was denied or AR is unsupported.");
    }

    private void ActivateARMode()
    {
        SetFallbackVisible(false);
        SetNonAREnabled(false);
        SetAREnabled(true);
    }

    private void ActivateNonARMode()
    {
        SetAREnabled(false);
        SetNonAREnabled(true);
        SetFallbackVisible(true);
        Debug.Log("IOSARBootstrap: Running in non-AR fallback mode.");
    }
}