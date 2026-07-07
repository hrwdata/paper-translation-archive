import Archive.EuclidElementsI47.Statements

namespace Archive.EuclidElementsI47

theorem square_comm (a b : Nat) : square a + square b = square b + square a := by
  rw [Nat.add_comm]

theorem pythagorean_style_statement (a b c : Nat) (h : PythagoreanStyle a b c) : PythagoreanStyle a b c := by
  exact h

theorem pythagorean_style_reverse (a b c : Nat) (h : PythagoreanStyle a b c) :
    square a + square b = square c := by
  simpa [PythagoreanStyle] using h.symm

end Archive.EuclidElementsI47
