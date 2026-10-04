import { useEffect, useRef, useState } from "react"
import { LayoutChangeEvent, ScrollView, View } from "react-native"
import * as Haptics from "expo-haptics"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  Easing,
  runOnJS,
  scrollTo,
  SharedValue,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

type Identifiable = { id: string }
type Positions = Record<string, number>

type SortableGridProps<T extends Identifiable> = {
  data: T[]
  enabled: boolean
  itemHeight: number
  columnGap: number
  rowGap: number
  contentBottomPadding?: number
  renderItem: (item: T) => React.ReactNode
  onReorder: (orderedIds: string[]) => void
}

function positionsFor<T extends Identifiable>(data: T[]): Positions {
  return Object.fromEntries(data.map((item, index) => [item.id, index]))
}

function triggerLiftHaptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
}

function triggerMoveHaptic() {
  void Haptics.selectionAsync()
}

function SortableGridItem<T extends Identifiable>({
  item,
  initialIndex,
  itemCount,
  itemWidth,
  itemHeight,
  columnGap,
  rowGap,
  containerWidth,
  positions,
  scrollOffset,
  scrollRef,
  viewportTop,
  viewportHeight,
  contentHeight,
  enabled,
  children,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  item: T
  initialIndex: number
  itemCount: number
  itemWidth: number
  itemHeight: number
  columnGap: number
  rowGap: number
  containerWidth: number
  positions: SharedValue<Positions>
  scrollOffset: SharedValue<number>
  scrollRef: ReturnType<typeof useAnimatedRef<ScrollView>>
  viewportTop: SharedValue<number>
  viewportHeight: SharedValue<number>
  contentHeight: number
  enabled: boolean
  children: React.ReactNode
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDrop: (positions: Positions) => void
}) {
  const active = useSharedValue(false)
  const translationX = useSharedValue(0)
  const translationY = useSharedValue(0)
  const startIndex = useSharedValue(initialIndex)
  const startScrollOffset = useSharedValue(0)

  const gesture = Gesture.Pan()
    .enabled(enabled)
    .activateAfterLongPress(350)
    .onStart(() => {
      active.value = true
      translationX.value = 0
      translationY.value = 0
      startIndex.value = positions.value[item.id] ?? initialIndex
      startScrollOffset.value = scrollOffset.value
      runOnJS(triggerLiftHaptic)()
      runOnJS(onDragStart)(item.id)
    })
    .onUpdate((event) => {
      const edgeSize = 56
      const maxScrollOffset = Math.max(0, contentHeight - viewportHeight.value)
      let nextScrollOffset = scrollOffset.value

      if (event.absoluteY < viewportTop.value + edgeSize) {
        nextScrollOffset = Math.max(0, nextScrollOffset - 10)
      } else if (
        event.absoluteY >
        viewportTop.value + viewportHeight.value - edgeSize
      ) {
        nextScrollOffset = Math.min(maxScrollOffset, nextScrollOffset + 10)
      }

      if (nextScrollOffset !== scrollOffset.value) {
        scrollOffset.set(nextScrollOffset)
        scrollTo(scrollRef, 0, nextScrollOffset, false)
      }

      translationX.value = event.translationX
      translationY.value =
        event.translationY + nextScrollOffset - startScrollOffset.value

      const startColumn = startIndex.value % 2
      const startRow = Math.floor(startIndex.value / 2)
      const centerX =
        startColumn * (itemWidth + columnGap) +
        event.translationX +
        itemWidth / 2
      const centerY =
        startRow * (itemHeight + rowGap) + translationY.value + itemHeight / 2
      const column = centerX < containerWidth / 2 ? 0 : 1
      const row = Math.max(0, Math.floor(centerY / (itemHeight + rowGap)))
      const targetIndex = Math.min(itemCount - 1, row * 2 + column)
      const currentIndex = positions.value[item.id] ?? initialIndex

      if (targetIndex === currentIndex) return

      const nextPositions = { ...positions.value }

      for (const id of Object.keys(nextPositions)) {
        const index = nextPositions[id]
        if (targetIndex > currentIndex) {
          if (index > currentIndex && index <= targetIndex) {
            nextPositions[id] = index - 1
          }
        } else if (index >= targetIndex && index < currentIndex) {
          nextPositions[id] = index + 1
        }
      }

      nextPositions[item.id] = targetIndex
      positions.set(nextPositions)
      runOnJS(triggerMoveHaptic)()
    })
    .onEnd(() => {
      active.value = false
      runOnJS(onDrop)(positions.value)
      runOnJS(onDragEnd)()
    })
    .onFinalize(() => {
      active.value = false
      runOnJS(onDragEnd)()
    })

  const animatedStyle = useAnimatedStyle(() => {
    const index = positions.value[item.id] ?? initialIndex
    const column = index % 2
    const row = Math.floor(index / 2)
    const targetX = column * (itemWidth + columnGap)
    const targetY = row * (itemHeight + rowGap)

    if (active.value) {
      const originColumn = startIndex.value % 2
      const originRow = Math.floor(startIndex.value / 2)
      return {
        zIndex: 10,
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 7 },
        transform: [
          {
            translateX:
              originColumn * (itemWidth + columnGap) + translationX.value,
          },
          {
            translateY: originRow * (itemHeight + rowGap) + translationY.value,
          },
          { scale: 1.025 },
        ],
      }
    }

    return {
      zIndex: 0,
      elevation: 0,
      shadowOpacity: 0,
      transform: [
        {
          translateX: withTiming(targetX, {
            duration: 160,
            easing: Easing.out(Easing.cubic),
          }),
        },
        {
          translateY: withTiming(targetY, {
            duration: 160,
            easing: Easing.out(Easing.cubic),
          }),
        },
        { scale: withTiming(1, { duration: 130 }) },
      ],
    }
  })

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            top: 0,
            width: itemWidth,
            height: itemHeight,
          },
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  )
}

export function SortableGrid<T extends Identifiable>({
  data,
  enabled,
  itemHeight,
  columnGap,
  rowGap,
  contentBottomPadding = 20,
  renderItem,
  onReorder,
}: SortableGridProps<T>) {
  const viewportRef = useRef<View>(null)
  const scrollRef = useAnimatedRef<ScrollView>()
  const [containerWidth, setContainerWidth] = useState(0)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const positions = useSharedValue<Positions>(positionsFor(data))
  const scrollOffset = useSharedValue(0)
  const viewportTop = useSharedValue(0)
  const viewportHeight = useSharedValue(0)

  useEffect(() => {
    if (!draggingId) {
      positions.value = positionsFor(data)
    }
  }, [data, draggingId, positions])

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollOffset.value = event.contentOffset.y
  })

  const rows = Math.ceil(data.length / 2)
  const gridHeight =
    rows === 0 ? 0 : rows * itemHeight + Math.max(0, rows - 1) * rowGap
  const itemWidth = (containerWidth - columnGap) / 2

  function measureViewport(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout
    setContainerWidth(width)
    viewportHeight.value = height
    viewportRef.current?.measureInWindow((_x, y) => {
      viewportTop.value = y
    })
  }

  function commitPositions(nextPositions: Positions) {
    const orderedIds = Object.entries(nextPositions)
      .sort(([, left], [, right]) => left - right)
      .map(([id]) => id)
    onReorder(orderedIds)
  }

  return (
    <View
      ref={viewportRef}
      style={{ flex: 1, overflow: "visible" }}
      onLayout={measureViewport}
    >
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        scrollEnabled={!draggingId}
        removeClippedSubviews={false}
        style={{ overflow: draggingId ? "visible" : "hidden" }}
        contentContainerStyle={{
          paddingBottom: contentBottomPadding,
          overflow: draggingId ? "visible" : "hidden",
        }}
      >
        <View style={{ height: gridHeight, overflow: "visible" }}>
          {containerWidth > 0
            ? data.map((item, index) => (
                <SortableGridItem
                  key={item.id}
                  item={item}
                  initialIndex={index}
                  itemCount={data.length}
                  itemWidth={itemWidth}
                  itemHeight={itemHeight}
                  columnGap={columnGap}
                  rowGap={rowGap}
                  containerWidth={containerWidth}
                  positions={positions}
                  scrollOffset={scrollOffset}
                  scrollRef={scrollRef}
                  viewportTop={viewportTop}
                  viewportHeight={viewportHeight}
                  contentHeight={gridHeight + contentBottomPadding}
                  enabled={enabled}
                  onDragStart={setDraggingId}
                  onDragEnd={() => setDraggingId(null)}
                  onDrop={commitPositions}
                >
                  {renderItem(item)}
                </SortableGridItem>
              ))
            : null}
        </View>
      </Animated.ScrollView>
    </View>
  )
}
