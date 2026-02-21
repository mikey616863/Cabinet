using UnityEngine;

public class CabinetMaterialSwitcher : MonoBehaviour
{
    [Header("Target")]
    [SerializeField] private GameObject cabinetObject;

    [Header("Materials")]
    [SerializeField] private Material[] materials;

    private Renderer cabinetRenderer;
    private int currentIndex;

    private void Awake()
    {
        if (cabinetObject == null)
        {
            cabinetObject = GameObject.Find("Cabinet");
        }

        if (cabinetObject == null)
        {
            Debug.LogError("CabinetMaterialSwitcher: Could not find a GameObject named 'Cabinet'.");
            return;
        }

        cabinetRenderer = cabinetObject.GetComponent<Renderer>();

        if (cabinetRenderer == null)
        {
            Debug.LogError("CabinetMaterialSwitcher: 'Cabinet' does not have a Renderer component.");
            return;
        }

        if (materials == null || materials.Length == 0)
        {
            Debug.LogWarning("CabinetMaterialSwitcher: No materials assigned.");
            return;
        }

        currentIndex = Mathf.Clamp(currentIndex, 0, materials.Length - 1);
        cabinetRenderer.material = materials[currentIndex];
    }

    public void NextMaterial()
    {
        if (!CanSwitch()) return;

        currentIndex = (currentIndex + 1) % materials.Length;
        cabinetRenderer.material = materials[currentIndex];
    }

    public void SetMaterialByIndex(int index)
    {
        if (!CanSwitch()) return;
        if (index < 0 || index >= materials.Length) return;

        currentIndex = index;
        cabinetRenderer.material = materials[currentIndex];
    }

    private bool CanSwitch()
    {
        return cabinetRenderer != null && materials != null && materials.Length > 0;
    }
}