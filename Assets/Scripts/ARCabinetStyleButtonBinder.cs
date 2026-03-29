using UnityEngine;
using UnityEngine.UI;

public class ARCabinetStyleButtonBinder : MonoBehaviour
{
    [System.Serializable]
    public class ButtonStylePair
    {
        public Button button;
        public int styleIndex;
    }

    [SerializeField] private ARCabinetPlacer cabinetPlacer;
    [SerializeField] private ButtonStylePair[] styleButtons;

    private void Awake()
    {
        if (cabinetPlacer == null)
        {
            cabinetPlacer = FindObjectOfType<ARCabinetPlacer>();
        }

        if (cabinetPlacer == null || styleButtons == null || styleButtons.Length == 0)
        {
            return;
        }

        for (int i = 0; i < styleButtons.Length; i++)
        {
            ButtonStylePair pair = styleButtons[i];
            if (pair == null || pair.button == null)
            {
                continue;
            }

            int capturedIndex = pair.styleIndex;
            pair.button.onClick.AddListener(() => cabinetPlacer.SetStyleByIndex(capturedIndex));
        }
    }
}