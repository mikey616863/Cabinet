using UnityEngine;
using UnityEngine.UI;

#if TMP_PRESENT
using TMPro;
#endif

public class ARCabinetStyleLabel : MonoBehaviour
{
    [SerializeField] private ARCabinetPlacer cabinetPlacer;
    [SerializeField] private Text uiText;

#if TMP_PRESENT
    [SerializeField] private TMP_Text tmpText;
#endif

    [SerializeField] private string prefix = "Style: ";

    private void Awake()
    {
        if (cabinetPlacer == null)
        {
            cabinetPlacer = FindObjectOfType<ARCabinetPlacer>();
        }

        if (uiText == null)
        {
            uiText = GetComponent<Text>();
        }

        if (uiText == null)
        {
            uiText = GetComponentInChildren<Text>(true);
        }
    }

    private void OnEnable()
    {
        if (cabinetPlacer == null)
        {
            return;
        }

        cabinetPlacer.StyleChanged += HandleStyleChanged;
        HandleStyleChanged(cabinetPlacer.CurrentStyleName);
    }

    private void OnDisable()
    {
        if (cabinetPlacer == null)
        {
            return;
        }

        cabinetPlacer.StyleChanged -= HandleStyleChanged;
    }

    private void HandleStyleChanged(string styleName)
    {
        string displayValue = prefix + styleName;

        if (uiText != null)
        {
            uiText.text = displayValue;
            return;
        }

#if TMP_PRESENT
        if (tmpText != null)
        {
            tmpText.text = displayValue;
        }
#endif
    }
}