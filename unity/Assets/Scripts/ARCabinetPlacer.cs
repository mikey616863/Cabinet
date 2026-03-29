using System.Collections.Generic;
using System;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

public class ARCabinetPlacer : MonoBehaviour
{
    public event Action<string> StyleChanged;

    [Header("AR References")]
    [SerializeField] private ARRaycastManager raycastManager;
    [SerializeField] private ARPlaneManager planeManager;
    [SerializeField] private Camera arCamera;

    [Header("Cabinet")]
    [SerializeField] private GameObject cabinetPrefab;
    [SerializeField] private bool placeOnlyOnce = false;

    [Header("Overlay Cheat")]
    [SerializeField] private bool useOversizedOverlay = true;
    [SerializeField] private float overlayScaleMultiplier = 1.05f;

    [Header("Placement Reticle")]
    [SerializeField] private GameObject reticleObject;

    [Header("Editor Placement")]
    [SerializeField] private bool enableEditorPlacementFallback = true;
    [SerializeField] private float editorPlacementDistance = 2.0f;

    [Header("Cabinet Materials")]
    [SerializeField] private Material oakMaterial;
    [SerializeField] private Material whiteMaterial;
    [SerializeField] private Material[] styleMaterials;
    [SerializeField] private int oakStyleIndex = 0;
    [SerializeField] private int whiteStyleIndex = 1;

    [Header("Material Quality")]
    [SerializeField] private bool warnIfMaterialIsNotPBR = true;

    private static readonly List<ARRaycastHit> RaycastHits = new List<ARRaycastHit>();
    private GameObject placedCabinet;
    private Vector3 cabinetOriginalLocalScale;
    private bool hasCachedOriginalScale;
    private int currentStyleIndex;
    private string currentStyleName = "Default";
    private Pose latestWallPose;
    private bool hasWallPose;

    public string CurrentStyleName => currentStyleName;

    private void Awake()
    {
        if (raycastManager == null)
        {
            raycastManager = FindObjectOfType<ARRaycastManager>();
        }

        if (planeManager == null)
        {
            planeManager = FindObjectOfType<ARPlaneManager>();
        }

        if (arCamera == null)
        {
            arCamera = Camera.main;
        }

        SyncLegacyMaterialsIntoStyleArray();
        ValidateStyleMaterials();
    }

    private void Update()
    {
        if (raycastManager == null || planeManager == null || cabinetPrefab == null)
        {
            SetReticleVisible(false);
            return;
        }

#if UNITY_EDITOR
        if (TryHandleEditorPlacement())
        {
            return;
        }
#endif

        UpdateReticle();

        if (Input.touchCount == 0)
        {
            return;
        }

        Touch touch = Input.GetTouch(0);
        if (touch.phase != TouchPhase.Began)
        {
            return;
        }

        if (EventSystem.current != null && EventSystem.current.IsPointerOverGameObject(touch.fingerId))
        {
            return;
        }

        if (!TryGetWallPose(touch.position, out Pose touchWallPose))
        {
            return;
        }

        PlaceCabinet(touchWallPose);
    }

#if UNITY_EDITOR
    private bool TryHandleEditorPlacement()
    {
        if (!enableEditorPlacementFallback)
        {
            return false;
        }

        if (!Input.GetMouseButtonDown(0))
        {
            return false;
        }

        if (EventSystem.current != null && EventSystem.current.IsPointerOverGameObject())
        {
            return true;
        }

        if (arCamera == null)
        {
            return true;
        }

        Ray screenRay = arCamera.ScreenPointToRay(Input.mousePosition);

        if (Physics.Raycast(screenRay, out RaycastHit hit))
        {
            Vector3 forward = -hit.normal;
            Quaternion rotation = Quaternion.LookRotation(forward, Vector3.up);
            PlaceCabinet(new Pose(hit.point, rotation));
            return true;
        }

        Vector3 fallbackPoint = arCamera.transform.position + arCamera.transform.forward * Mathf.Max(0.25f, editorPlacementDistance);
        Quaternion fallbackRotation = Quaternion.LookRotation(arCamera.transform.forward, Vector3.up);
        PlaceCabinet(new Pose(fallbackPoint, fallbackRotation));
        return true;
    }
#endif

    private void UpdateReticle()
    {
        Vector2 screenCenter = arCamera != null
            ? new Vector2(arCamera.pixelWidth * 0.5f, arCamera.pixelHeight * 0.5f)
            : new Vector2(Screen.width * 0.5f, Screen.height * 0.5f);

        hasWallPose = TryGetWallPose(screenCenter, out latestWallPose);
        if (!hasWallPose)
        {
            SetReticleVisible(false);
            return;
        }

        if (reticleObject != null)
        {
            reticleObject.transform.SetPositionAndRotation(latestWallPose.position, latestWallPose.rotation);
        }

        SetReticleVisible(true);
    }

    private bool TryGetWallPose(Vector2 screenPosition, out Pose wallPose)
    {
        wallPose = default;

        if (!raycastManager.Raycast(screenPosition, RaycastHits, TrackableType.PlaneWithinPolygon))
        {
            return false;
        }

        for (int i = 0; i < RaycastHits.Count; i++)
        {
            ARRaycastHit hit = RaycastHits[i];
            ARPlane plane = planeManager.GetPlane(hit.trackableId);

            if (plane == null)
            {
                continue;
            }

            if (plane.alignment == PlaneAlignment.Vertical || plane.alignment == PlaneAlignment.VerticalDown || plane.alignment == PlaneAlignment.VerticalUp)
            {
                wallPose = hit.pose;
                return true;
            }
        }

        return false;
    }

    private void SetReticleVisible(bool visible)
    {
        if (reticleObject != null)
        {
            reticleObject.SetActive(visible);
        }
    }

    private void PlaceCabinet(Pose pose)
    {
        if (placedCabinet != null && placeOnlyOnce)
        {
            return;
        }

        if (placedCabinet == null)
        {
            placedCabinet = Instantiate(cabinetPrefab, pose.position, pose.rotation);
            CacheAndApplyOverlayScale();
            ApplyCurrentStyle();
            return;
        }

        placedCabinet.transform.SetPositionAndRotation(pose.position, pose.rotation);
        CacheAndApplyOverlayScale();
        ApplyCurrentStyle();
    }

    private void CacheAndApplyOverlayScale()
    {
        if (placedCabinet == null)
        {
            return;
        }

        if (!hasCachedOriginalScale)
        {
            cabinetOriginalLocalScale = placedCabinet.transform.localScale;
            hasCachedOriginalScale = true;
        }

        if (!useOversizedOverlay)
        {
            placedCabinet.transform.localScale = cabinetOriginalLocalScale;
            return;
        }

        float safeMultiplier = Mathf.Max(0.01f, overlayScaleMultiplier);
        placedCabinet.transform.localScale = cabinetOriginalLocalScale * safeMultiplier;
    }

    public void SetOak()
    {
        if (styleMaterials != null && styleMaterials.Length > 0)
        {
            SetStyleByIndex(oakStyleIndex);
            return;
        }

        ApplyMaterial(oakMaterial);
        NotifyStyleChanged("Oak");
    }

    public void SetWhite()
    {
        if (styleMaterials != null && styleMaterials.Length > 0)
        {
            SetStyleByIndex(whiteStyleIndex);
            return;
        }

        ApplyMaterial(whiteMaterial);
        NotifyStyleChanged("White");
    }

    public void SetStyleByIndex(int styleIndex)
    {
        if (styleMaterials == null || styleMaterials.Length == 0)
        {
            return;
        }

        if (styleIndex < 0 || styleIndex >= styleMaterials.Length)
        {
            return;
        }

        currentStyleIndex = styleIndex;
        ApplyCurrentStyle();
    }

    public void NextStyle()
    {
        if (styleMaterials == null || styleMaterials.Length == 0)
        {
            return;
        }

        currentStyleIndex = (currentStyleIndex + 1) % styleMaterials.Length;
        ApplyCurrentStyle();
    }

    private void ApplyCurrentStyle()
    {
        if (styleMaterials == null || styleMaterials.Length == 0)
        {
            return;
        }

        if (currentStyleIndex < 0 || currentStyleIndex >= styleMaterials.Length)
        {
            currentStyleIndex = Mathf.Clamp(currentStyleIndex, 0, styleMaterials.Length - 1);
        }

        Material selectedMaterial = styleMaterials[currentStyleIndex];
        ApplyMaterial(selectedMaterial);
        NotifyStyleChanged(selectedMaterial != null ? selectedMaterial.name : "Style " + currentStyleIndex);
    }

    private void ApplyMaterial(Material targetMaterial)
    {
        if (placedCabinet == null || targetMaterial == null)
        {
            return;
        }

        Renderer[] renderers = placedCabinet.GetComponentsInChildren<Renderer>(true);
        for (int i = 0; i < renderers.Length; i++)
        {
            renderers[i].material = targetMaterial;
        }
    }

    private void SyncLegacyMaterialsIntoStyleArray()
    {
        if (styleMaterials != null && styleMaterials.Length > 0)
        {
            return;
        }

        List<Material> fallbackStyles = new List<Material>(2);
        if (oakMaterial != null)
        {
            fallbackStyles.Add(oakMaterial);
        }

        if (whiteMaterial != null)
        {
            fallbackStyles.Add(whiteMaterial);
        }

        styleMaterials = fallbackStyles.ToArray();
    }

    private void ValidateStyleMaterials()
    {
        if (!warnIfMaterialIsNotPBR || styleMaterials == null)
        {
            return;
        }

        for (int i = 0; i < styleMaterials.Length; i++)
        {
            Material styleMaterial = styleMaterials[i];
            if (styleMaterial == null || styleMaterial.shader == null)
            {
                continue;
            }

            string shaderName = styleMaterial.shader.name;
            bool seemsPBR = shaderName.Contains("Standard") || shaderName.Contains("Lit");
            if (!seemsPBR)
            {
                Debug.LogWarning("ARCabinetPlacer: Style material '" + styleMaterial.name + "' may not be using a PBR shader. Use Standard, URP Lit, or HDRP Lit for best realism.");
            }
        }
    }

    private void NotifyStyleChanged(string styleName)
    {
        currentStyleName = string.IsNullOrWhiteSpace(styleName) ? "Default" : styleName;
        StyleChanged?.Invoke(currentStyleName);
    }
}