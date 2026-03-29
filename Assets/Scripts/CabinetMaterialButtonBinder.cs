using UnityEngine;
using UnityEngine.UI;

public class CabinetMaterialButtonBinder : MonoBehaviour
{
    [System.Serializable]
    public class ButtonMaterialPair
    {
        public Button button;
        public int materialIndex;
    }

    [SerializeField] private CabinetMaterialSwitcher materialSwitcher;
    [SerializeField] private ButtonMaterialPair[] buttonMappings;

    private void Awake()
    {
        if (materialSwitcher == null)
        {
            materialSwitcher = FindObjectOfType<CabinetMaterialSwitcher>();
        }

        if (materialSwitcher == null)
        {
            Debug.LogError("CabinetMaterialButtonBinder: No CabinetMaterialSwitcher found in the scene.");
            return;
        }

        if (buttonMappings == null || buttonMappings.Length == 0)
        {
            Debug.LogWarning("CabinetMaterialButtonBinder: No button mappings configured.");
            return;
        }

        for (int i = 0; i < buttonMappings.Length; i++)
        {
            ButtonMaterialPair mapping = buttonMappings[i];
            if (mapping == null || mapping.button == null)
            {
                continue;
            }

            int capturedIndex = mapping.materialIndex;
            mapping.button.onClick.AddListener(() => materialSwitcher.SetMaterialByIndex(capturedIndex));
        }
    }
}