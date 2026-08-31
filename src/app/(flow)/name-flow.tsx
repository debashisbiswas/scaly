import { useRouter } from "expo-router"
import { useState } from "react"
import { Alert, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { getFlowCreationErrorMessage } from "@/core/flows"

import TopBar from "@/components/TopBar"
import { useFlowStore } from "@/providers/FlowStoreProvider"
import { Ionicons } from "@expo/vector-icons"

export default function ChooseTempo() {
  const router = useRouter()
  const { editingFlow, saveFlow } = useFlowStore()
  const [flowName, setFlowName] = useState(editingFlow?.name ?? "")
  const [isSaving, setIsSaving] = useState(false)
  const canProceed = flowName.trim().length > 0 && !isSaving

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Name this Flow"
        subtitle="This can be changed later"
        onBack={() => router.back()}
        onNext={async () => {
          if (!canProceed) {
            return
          }

          setIsSaving(true)

          try {
            const result = await saveFlow(flowName)

            if (!result.ok) {
              Alert.alert(
                editingFlow ? "Unable to save flow" : "Unable to create flow",
                editingFlow && result.errors.length === 0
                  ? "Unable to save flow."
                  : getFlowCreationErrorMessage(result.errors, flowName),
              )
              return
            }

            router.replace("/flow-library")
          } finally {
            setIsSaving(false)
          }
        }}
        nextDisabled={!canProceed}
        nextLabel={<Ionicons name="checkmark-sharp" size={34} />}
      />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingTop: 24,
        }}
      >
        <TextInput
          value={flowName}
          onChangeText={setFlowName}
          placeholder="My Scale Routine"
          style={{
            borderWidth: 1,
            borderColor: "#000",
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
          }}
          autoCorrect={false}
          returnKeyType="done"
        />
      </View>
    </SafeAreaView>
  )
}
